var sketch = require('sketch')
var Document = require('sketch/dom').Document
var document = Document.getSelectedDocument()

var texts = []
var paints = []
var shadows = []
var blurs = []
var output = {}

export default function () {


  /*
  Sketch's document.getTextStyles() doesn't return all the info, and returns an MSArray
  
  Types:
  0 layerStyles
  1 textStyles
  
  Returns a JavaScript Array of styles
  */
  function getSharedStyles(type) {
    var myStyles = []
    if (sketch.version.sketch < 52) {
      var styles = (type == 0) ? MSDocument.currentDocument().documentData().layerStyles().objects() : MSDocument.currentDocument().documentData().layerTextStyles().objects();
    } else {
      var styles = (type == 0) ? MSDocument.currentDocument().documentData().allLayerStyles() : MSDocument.currentDocument().documentData().allTextStyles();
    }

    var sortByName = NSSortDescriptor.sortDescriptorWithKey_ascending("name", 1);
    styles = styles.sortedArrayUsingDescriptors([sortByName]);
    styles.forEach(style => {
      myStyles.push(style)
    })
    return myStyles;
  }



  var textStyles = getSharedStyles(1)

  /*
  Optional - Filter so we only get left aligned text, and the base colour.
  Figma's less explicit around type alignment and colour for styles.
  Therefore we only need to extract the Font Family, Weight, Size, Line Height and Kerning
  
  We ignore text decoration in these cases. Underlining should be done at the designers discrepancy in the design outputs.
  Italic / Oblique fonts are pulled through, this is a side-effect of getting the weight from the PostScript name. 
   
  */
  textStyles = textStyles.filter(style => style.name().includes('inkBase') && document.getSharedTextStyleWithID(style.objectID()).style.alignment == 'left')



  textStyles.forEach(style => {

    //Output object
    o = {}
    o.type = "TEXT"

    //The input style
    inp = document.getSharedTextStyleWithID(style.objectID()).style

    //Extracting the name of the weight from the Postscript name, Figma expects this in title case with spaces.
    let fontStyle = style.style().textStyle().fontPostscriptName().split('-')[1].replace(/([a-z0-9])([A-Z])/g, '$1 $2')



    //Remove the ink name from the token name
    let n = style.name().split('/')
    n.pop()
    o.name = n.join('/')

    o.fontSize = inp.fontSize
    o.fontName = {
      family: inp.fontFamily,
      style: fontStyle
    }
    o.lineHeight = {
      unit: "PIXELS",
      value: inp.lineHeight
    }
    o.letterSpacing = inp.kerning
    o.paragraphSpacing = inp.paragraphSpacing


    texts.push(o)
  })



  //Filter out styles that aren't fills.
  const regex = RegExp('(0[123457])', 'g')
  fills = getSharedStyles(0).filter(style => regex.test(style.name().split('/')[0]) && !style.name().includes('border'))



  //TODO
  //If gradient, type = gradient
  //Add gradient stops if they exist.
  fills.forEach(style => {
    inp = style.style()
    o = {}
    o.type = "SOLID"
    o.name = `${style.name()}`
    //If a style doesn't have a fill, it causes an error
    try {
      let color = inp.fills()[0].color()
      o.color = {
        r: color.red(),
        g: color.green(),
        b: color.blue()
      }
      o.opacity = color.alpha()
    } catch (e) {
      console.error(style.name())
    }

    paints.push(o)
  })



  /*
  Get the shadow styles
  Sketch's API doesn't let us fetch the blend mode of a shadow.
  But, there's no logical way to set the blend mode of a box-shadow in CSS, so we ignore and set it to 'NORMAL'
  Figma doesn't allow for Spread on drop shadows. Something something GPU intensive blah blah.. 
  We include it here anyway, because maybe one day in the future they'll enable it.
  */
  shadowStyles = getSharedStyles(0).filter(style => style.name().includes('Shadows'))

  shadowStyles.forEach(style => {
    o = {}
    o.type = "EFFECT"
    inp = style.style()

    o.effects = []

    inp.shadows().forEach(shadow => {
      e = {}
      e.type = "DROP_SHADOW"
      e.color = {
        r: shadow.color().red(),
        g: shadow.color().green(),
        b: shadow.color().blue(),
        a: shadow.color().alpha()
      }
      e.offset = {
        x: shadow.offsetX,
        y: shadow.offsetY
      }
      e.radius = shadow.blurRadius()
      e.spread = shadow.spread()
    })

    o.effects.push(e)
    shadows.push(o)
  })



  /*
  Blur effects, this isn't the best implementation.. NewsKit was built on top of Sketch's implementations,
  Blurs aren't fully accounted for in NewsKit
  Sketch Types
  0 Gaussian (Figma Layer Blur)
  1 Motion (Unsupported in Figma)
  2 Zoom  (Unsuppoted in Figma)
  3 Background
  
  */
  blurStyles = getSharedStyles(0).filter(style => style.style().blur().isEnabled() == 1 && style.name().includes('border'))
  blurStyles.forEach(style => {
    inp = style.style().blur()

    o = {}
    o.type = "EFFECT"
    //Need a better Naming System here...
    o.name = 'Blur/' + style.name()
    o.effects = []
    e = {}
    switch (inp.type()) {
      case 0:
        e.type = "LAYER_BLUR"
        break;
      case 1:
        console.warn('Motion Blurs are unsupported by Figma')
        break;
      case 2:
        console.warn('Zoom Blurs are unsupported by Figma')
        break;
      case 3:
        e.type = "BACKGROUND_BLUR"
        break;
    }

    e.radius = inp.radius
    //Saturation is not yet supported for background blurs in Figma.. but we send the data anyway.
    inp.saturation() ? e.saturation = inp.saturation() : null

    o.effects.push(e)
    blurs.push(o)
  })


  //Combine all the styles into one Object
  output.texts = texts
  output.paints = paints
  output.blurs = blurs
  output.shadows = shadows

  const str = JSON.stringify(output, null, 4)

  //Make a dialog box to show the output
  var UI = require('sketch/ui')
  UI.getInputFromUser(
    "Style Output:", {
      description: "Click Ok to copy to clipboard",
      initialValue: str,
      type: UI.INPUT_TYPE.string,
      numberOfLines: 20

    },
    (err, value) => {

      if (err) {
        // most likely the user canceled the input
        return
      }
      if (value) {
        //Copy styles when they hit Ok
        var pasteBoard = NSPasteboard.generalPasteboard()
        pasteBoard.declareTypes_owner(NSArray.arrayWithObject(NSPasteboardTypeString), nil)
        pasteBoard.setString_forType(str, NSPasteboardTypeString)
        UI.message('Copied styles to clipboard')
      }
    }
  )



}