var globalThis = this;
var global = this;
function __skpm_run (key, context) {
  globalThis.context = context;
  try {

var exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/my-command.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/my-command.js":
/*!***************************!*\
  !*** ./src/my-command.js ***!
  \***************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var sketch = __webpack_require__(/*! sketch */ "sketch");

var Document = __webpack_require__(/*! sketch/dom */ "sketch/dom").Document;

var document = Document.getSelectedDocument();
var texts = [];
var paints = [];
var shadows = [];
var blurs = [];
var output = {};
/* harmony default export */ __webpack_exports__["default"] = (function () {
  /*
  Sketch's document.getTextStyles() doesn't return all the info, and returns an MSArray
  
  Types:
  0 layerStyles
  1 textStyles
  
  Returns a JavaScript Array of styles
  */
  function getSharedStyles(type) {
    var myStyles = [];

    if (sketch.version.sketch < 52) {
      var styles = type == 0 ? MSDocument.currentDocument().documentData().layerStyles().objects() : MSDocument.currentDocument().documentData().layerTextStyles().objects();
    } else {
      var styles = type == 0 ? MSDocument.currentDocument().documentData().allLayerStyles() : MSDocument.currentDocument().documentData().allTextStyles();
    }

    var sortByName = NSSortDescriptor.sortDescriptorWithKey_ascending("name", 1);
    styles = styles.sortedArrayUsingDescriptors([sortByName]);
    styles.forEach(function (style) {
      myStyles.push(style);
    });
    return myStyles;
  }

  var textStyles = getSharedStyles(1);
  /*
  Optional - Filter so we only get left aligned text, and the base colour.
  Figma's less explicit around type alignment and colour for styles.
  Therefore we only need to extract the Font Family, Weight, Size, Line Height and Kerning
  
  We ignore text decoration in these cases. Underlining should be done at the designers discrepancy in the design outputs.
  Italic / Oblique fonts are pulled through, this is a side-effect of getting the weight from the PostScript name. 
   
  */

  textStyles = textStyles.filter(function (style) {
    return style.name().includes('inkBase') && document.getSharedTextStyleWithID(style.objectID()).style.alignment == 'left';
  });
  textStyles.forEach(function (style) {
    //Output object
    o = {};
    o.type = "TEXT"; //The input style

    inp = document.getSharedTextStyleWithID(style.objectID()).style; //Extracting the name of the weight from the Postscript name, Figma expects this in title case with spaces.

    var fontStyle = style.style().textStyle().fontPostscriptName().split('-')[1].replace(/([a-z0-9])([A-Z])/g, '$1 $2'); //Remove the ink name from the token name

    var n = style.name().split('/');
    n.pop();
    o.name = n.join('/');
    o.fontSize = inp.fontSize;
    o.fontName = {
      family: inp.fontFamily,
      style: fontStyle
    };
    o.lineHeight = {
      unit: "PIXELS",
      value: inp.lineHeight
    };
    o.letterSpacing = inp.kerning;
    o.paragraphSpacing = inp.paragraphSpacing;
    texts.push(o);
  }); //Filter out styles that aren't fills.

  var regex = RegExp('(0[123457])', 'g');
  fills = getSharedStyles(0).filter(function (style) {
    return regex.test(style.name().split('/')[0]) && !style.name().includes('border');
  }); //TODO
  //If gradient, type = gradient
  //Add gradient stops if they exist.

  fills.forEach(function (style) {
    inp = style.style();
    o = {};
    o.type = "SOLID";
    o.name = "".concat(style.name()); //If a style doesn't have a fill, it causes an error

    try {
      var color = inp.fills()[0].color();
      o.color = {
        r: color.red(),
        g: color.green(),
        b: color.blue()
      };
      o.opacity = color.alpha();
    } catch (e) {
      console.error(style.name());
    }

    paints.push(o);
  });
  /*
  Get the shadow styles
  Sketch's API doesn't let us fetch the blend mode of a shadow.
  But, there's no logical way to set the blend mode of a box-shadow in CSS, so we ignore and set it to 'NORMAL'
  Figma doesn't allow for Spread on drop shadows. Something something GPU intensive blah blah.. 
  We include it here anyway, because maybe one day in the future they'll enable it.
  */

  shadowStyles = getSharedStyles(0).filter(function (style) {
    return style.name().includes('Shadows');
  });
  shadowStyles.forEach(function (style) {
    o = {};
    o.type = "EFFECT";
    inp = style.style();
    o.effects = [];
    inp.shadows().forEach(function (shadow) {
      e = {};
      e.type = "DROP_SHADOW";
      e.color = {
        r: shadow.color().red(),
        g: shadow.color().green(),
        b: shadow.color().blue(),
        a: shadow.color().alpha()
      };
      e.offset = {
        x: shadow.offsetX,
        y: shadow.offsetY
      };
      e.radius = shadow.blurRadius();
      e.spread = shadow.spread();
    });
    o.effects.push(e);
    shadows.push(o);
  });
  /*
  Blur effects, this isn't the best implementation.. NewsKit was built on top of Sketch's implementations,
  Blurs aren't fully accounted for in NewsKit
  Sketch Types
  0 Gaussian (Figma Layer Blur)
  1 Motion (Unsupported in Figma)
  2 Zoom  (Unsuppoted in Figma)
  3 Background
  
  */

  blurStyles = getSharedStyles(0).filter(function (style) {
    return style.style().blur().isEnabled() == 1 && style.name().includes('border');
  });
  blurStyles.forEach(function (style) {
    inp = style.style().blur();
    o = {};
    o.type = "EFFECT"; //Need a better Naming System here...

    o.name = 'Blur/' + style.name();
    o.effects = [];
    e = {};

    switch (inp.type()) {
      case 0:
        e.type = "LAYER_BLUR";
        break;

      case 1:
        console.warn('Motion Blurs are unsupported by Figma');
        break;

      case 2:
        console.warn('Zoom Blurs are unsupported by Figma');
        break;

      case 3:
        e.type = "BACKGROUND_BLUR";
        break;
    }

    e.radius = inp.radius; //Saturation is not yet supported for background blurs in Figma.. but we send the data anyway.

    inp.saturation() ? e.saturation = inp.saturation() : null;
    o.effects.push(e);
    blurs.push(o);
  }); //Combine all the styles into one Object

  output.texts = texts;
  output.paints = paints;
  output.blurs = blurs;
  output.shadows = shadows;
  var str = JSON.stringify(output, null, 4); //Make a dialog box to show the output

  var UI = __webpack_require__(/*! sketch/ui */ "sketch/ui");

  UI.getInputFromUser("Style Output:", {
    description: "Click Ok to copy to clipboard",
    initialValue: str,
    type: UI.INPUT_TYPE.string,
    numberOfLines: 20
  }, function (err, value) {
    if (err) {
      // most likely the user canceled the input
      return;
    }

    if (value) {
      //Copy styles when they hit Ok
      var pasteBoard = NSPasteboard.generalPasteboard();
      pasteBoard.declareTypes_owner(NSArray.arrayWithObject(NSPasteboardTypeString), nil);
      pasteBoard.setString_forType(str, NSPasteboardTypeString);
      UI.message('Copied styles to clipboard');
    }
  });
});

/***/ }),

/***/ "sketch":
/*!*************************!*\
  !*** external "sketch" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("sketch");

/***/ }),

/***/ "sketch/dom":
/*!*****************************!*\
  !*** external "sketch/dom" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("sketch/dom");

/***/ }),

/***/ "sketch/ui":
/*!****************************!*\
  !*** external "sketch/ui" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("sketch/ui");

/***/ })

/******/ });
    if (key === 'default' && typeof exports === 'function') {
      exports(context);
    } else if (typeof exports[key] !== 'function') {
      throw new Error('Missing export named "' + key + '". Your command should contain something like `export function " + key +"() {}`.');
    } else {
      exports[key](context);
    }
  } catch (err) {
    if (typeof process !== 'undefined' && process.listenerCount && process.listenerCount('uncaughtException')) {
      process.emit("uncaughtException", err, "uncaughtException");
    } else {
      throw err
    }
  }
}
globalThis['onRun'] = __skpm_run.bind(this, 'default')

//# sourceMappingURL=__my-command.js.map