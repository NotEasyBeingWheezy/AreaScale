// AreaScale v2.0.0 build

// ========================================
// CONFIG
// ========================================

// Preset definitions for different logo types
// You can modify the targetArea (in cm²) and position coordinates (in cm)
var PRESETS = {
    "Club Logo": {
        targetArea: 45,              // Set your desired surface area in cm²
        position: {
            x: 6.0,                  // Set X coordinate in cm
            y: 11.0,                  // Set Y coordinate in cm
            referencePoint: "OBJECT_BOTTOM_CENTER"  // Reference point for positioning (see options below)
        }
    },
    "Cap": {
        targetArea: 25,              // Set your desired surface area in cm²
        position: {
            x: 5.0,                  // Set X coordinate in cm
            y: 8.0,                  // Set Y coordinate in cm
            referencePoint: "ARTBOARD_ORIGIN"
        }
    },
    "Beanie, Slider, Bucket, Sunhat": {
        targetArea: 15,              // Set your desired surface area in cm²
        position: {
            x: 4.0,                  // Set X coordinate in cm
            y: 7.0,                  // Set Y coordinate in cm
            referencePoint: "OBJECT_BOTTOM_CENTER"
        }
    }
};

// ========================================
// REFERENCE POINT OPTIONS
// ========================================
// Available reference points for positioning:
//
// "ARTBOARD_ORIGIN"       - Measures from top-left corner of artboard (0,0)
//                           Object's top-left corner will be placed at specified x,y
//
// "ARTBOARD_CENTER"       - Measures from center of artboard
//                           Object's center will be placed at specified x,y from artboard center
//
// "OBJECT_CENTER"         - Places object's center at specified absolute coordinates
//                           X,Y are absolute positions on the artboard
//
// "OBJECT_TOP_LEFT"       - Places object's top-left corner at specified coordinates
//                           X,Y are absolute positions on the artboard
//
// "OBJECT_BOTTOM_CENTER"  - Places object's bottom-center at specified coordinates
//                           X,Y are absolute positions on the artboard
//
// ========================================

// Unit conversion constants
var PT_TO_CM = 0.0352778;  // 1 point = 0.0352778 cm
var CM_TO_PT = 1 / PT_TO_CM;

// ========================================
// CORE FUNCTIONS
// ========================================

/**
 * Resizes an item to the target area while maintaining aspect ratio
 * @param {Object} item - The Illustrator object to resize
 * @param {Number} targetArea - Target area in cm²
 * @returns {Object} Result object with dimensions and scaling info
 */
function resizeToTargetArea(item, targetArea) {
    // Get current dimensions in points
    var currentWidth = item.width;
    var currentHeight = item.height;

    // Convert to centimeters
    var widthCM = currentWidth * PT_TO_CM;
    var heightCM = currentHeight * PT_TO_CM;

    // Calculate current area in cm²
    var currentArea = widthCM * heightCM;

    // Calculate scaling factor needed to reach target area
    var scaleFactor = Math.sqrt(targetArea / currentArea);

    // Calculate new dimensions
    var newWidthCM = widthCM * scaleFactor;
    var newHeightCM = heightCM * scaleFactor;

    // Convert back to points
    var newWidth = newWidthCM * CM_TO_PT;
    var newHeight = newHeightCM * CM_TO_PT;

    // Apply new dimensions
    item.width = newWidth;
    item.height = newHeight;

    return {
        originalWidth: widthCM,
        originalHeight: heightCM,
        originalArea: currentArea,
        newWidth: newWidthCM,
        newHeight: newHeightCM,
        newArea: newWidthCM * newHeightCM,
        scaleFactor: scaleFactor
    };
}

/**
 * Positions an item based on the specified reference point and coordinates
 * @param {Object} item - The Illustrator object to position
 * @param {Number} x - X coordinate in cm
 * @param {Number} y - Y coordinate in cm
 * @param {String} referencePoint - The reference point to use for positioning
 * @param {Object} doc - The active document (for artboard dimensions)
 */
function positionItem(item, x, y, referencePoint, doc) {
    // Convert coordinates from cm to points
    var xPt = x * CM_TO_PT;
    var yPt = y * CM_TO_PT;

    var artboard = doc.artboards[doc.artboards.getActiveArtboardIndex()];
    var artboardRect = artboard.artboardRect; // [left, top, right, bottom]
    var artboardLeft = artboardRect[0];
    var artboardTop = artboardRect[1];
    var artboardRight = artboardRect[2];
    var artboardBottom = artboardRect[3];
    var artboardWidth = artboardRight - artboardLeft;
    var artboardHeight = artboardTop - artboardBottom;
    var artboardCenterX = artboardLeft + (artboardWidth / 2);
    var artboardCenterY = artboardTop - (artboardHeight / 2);

    switch(referencePoint) {
        case "ARTBOARD_ORIGIN":
            // Position from top-left corner of artboard (object's top-left at x,y from artboard origin)
            item.left = artboardLeft + xPt;
            item.top = artboardTop - yPt;
            break;

        case "ARTBOARD_CENTER":
            // Position from center of artboard (object's center at x,y from artboard center)
            item.left = artboardCenterX + xPt - (item.width / 2);
            item.top = artboardCenterY - yPt + (item.height / 2);
            break;

        case "OBJECT_CENTER":
            // Place object's center at absolute coordinates
            item.left = xPt - (item.width / 2);
            item.top = yPt + (item.height / 2);
            break;

        case "OBJECT_TOP_LEFT":
            // Place object's top-left at absolute coordinates
            item.left = xPt;
            item.top = yPt;
            break;

        case "OBJECT_BOTTOM_CENTER":
            // Place object's bottom-center at absolute coordinates
            item.left = xPt - (item.width / 2);
            item.top = yPt + item.height;
            break;

        default:
            // Default to artboard origin if unknown reference point
            item.left = artboardLeft + xPt;
            item.top = artboardTop - yPt;
            break;
    }
}

/**
 * Main function - creates dialog and processes selected items
 */
function main() {
    // Check if there's an active document
    if (app.documents.length === 0) {
        alert("Please open a document first.");
        return;
    }

    var doc = app.activeDocument;
    var selection = doc.selection;

    // Check if something is selected
    if (selection.length === 0) {
        alert("Please select at least one shape to resize and position.");
        return;
    }

    // Create dialog with dropdown menu
    var dialog = new Window("dialog", "Resize and Position");
    dialog.preferredSize = [350, 150];

    // Add label for dropdown
    dialog.add("statictext", undefined, "Select preset:");

    // Extract preset names (ExtendScript doesn't support Object.keys)
    var presetNames = [];
    for (var key in PRESETS) {
        if (PRESETS.hasOwnProperty(key)) {
            presetNames.push(key);
        }
    }

    // Create dropdown list with preset options
    var presetDropdown = dialog.add("dropdownlist", undefined, presetNames);
    presetDropdown.selection = 0;  // Select first item by default
    presetDropdown.preferredSize = [300, 25];

    // Add informational text
    var infoText = dialog.add("statictext", undefined, "This will automatically resize and position selected objects.");
    infoText.preferredSize = [300, 40];
    infoText.graphics.foregroundColor = infoText.graphics.newPen(infoText.graphics.PenType.SOLID_COLOR, [0.5, 0.5, 0.5], 1);

    // Add buttons
    var buttonGroup = dialog.add("group");
    buttonGroup.add("button", undefined, "OK", {name: "ok"});
    buttonGroup.add("button", undefined, "Cancel", {name: "cancel"});

    // Show dialog and process if OK is clicked
    if (dialog.show() === 1) {
        var selectedPresetName = presetDropdown.selection.text;
        var preset = PRESETS[selectedPresetName];

        // Process each selected item
        var results = [];
        for (var i = 0; i < selection.length; i++) {
            var item = selection[i];

            // Only process items that have width and height properties
            if (item.width && item.height) {
                // Resize the item
                var result = resizeToTargetArea(item, preset.targetArea);

                // Position the item
                positionItem(
                    item,
                    preset.position.x,
                    preset.position.y,
                    preset.position.referencePoint,
                    doc
                );

                result.presetName = selectedPresetName;
                result.positionX = preset.position.x;
                result.positionY = preset.position.y;
                result.referencePoint = preset.position.referencePoint;
                results.push(result);
            }
        }

        // Show results
        if (results.length > 0) {
            var message = "Processed " + results.length + " shape(s) with preset: " + selectedPresetName + "\n\n";
            for (var j = 0; j < results.length; j++) {
                var r = results[j];
                message += "Shape " + (j + 1) + ":\n";
                message += "  Original: " + r.originalWidth.toFixed(2) + " × " + r.originalHeight.toFixed(2) + " cm (" + r.originalArea.toFixed(2) + " cm²)\n";
                message += "  New: " + r.newWidth.toFixed(2) + " × " + r.newHeight.toFixed(2) + " cm (" + r.newArea.toFixed(2) + " cm²)\n";
                message += "  Scale: " + (r.scaleFactor * 100).toFixed(2) + "%\n";
                message += "  Position: (" + r.positionX.toFixed(2) + " cm, " + r.positionY.toFixed(2) + " cm) from " + r.referencePoint + "\n\n";
            }

            // Create result dialog
            var resultDialog = new Window("dialog", "Processing Results");
            resultDialog.orientation = "column";
            resultDialog.alignChildren = ["fill", "top"];

            var textGroup = resultDialog.add("group");
            textGroup.orientation = "column";
            textGroup.alignChildren = ["left", "top"];

            var resultText = textGroup.add("edittext", undefined, message, {multiline: true, scrolling: true});
            resultText.size = [450, 250];
            resultText.active = false;

            var btnGroup = resultDialog.add("group");
            btnGroup.alignment = "center";
            btnGroup.add("button", undefined, "OK", {name: "ok"});

            resultDialog.show();
        } else {
            alert("No valid shapes were found in the selection.");
        }
    }
}

// Run the script
main();
