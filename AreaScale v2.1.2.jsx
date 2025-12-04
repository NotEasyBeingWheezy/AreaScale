// AreaScale v2.1.2 build

// ========================================
// PRESET CONFIG
// ========================================

// Presets definitions for different logo types
// You can modify the targetArea (in cm²) and position coordinates (in cm)
var PRESETS = {
    "Club Logo": { // Preset name
        targetArea: 45, // Set desired surface area in cm²
        position: {
            x: 6.0, // Set X coordinate in cm
            y: 11.0, // Set Y coordinate in cm
            referencePoint: "OBJECT_BOTTOM_CENTER" // Reference point for positioning (see REFERENCE POINT CONFIG)
        }
    },
    "Front Panel Club Logo": {
        targetArea: 45,
        position: {
            x: 25.5,
            y: 11,
            referencePoint: "OBJECT_BOTTOM_CENTER"
        }
    },
    "Cap Logo": {
        targetArea: 25,
        position: {
            x: 5.0,
            y: 8.0,
            referencePoint: "OBJECT_BOTTOM_CENTER"
        }
    },
    "Beanie, Slider, Bucket hat, Sunhat Logo": {
        targetArea: 15,
        position: {
            x: 4.0,
            y: 7.0,
            referencePoint: "OBJECT_BOTTOM_CENTER"
        }
    }
};

// ========================================
// REFERENCE POINT CONFIG
// ========================================
// Available reference points for positioning (all coordinates measured from artboard top-left):
//
// "ARTBOARD_ORIGIN"       - Places object's top-left corner at x,y from artboard top-left
//                           Same as OBJECT_TOP_LEFT (kept for backward compatibility)
//
// "ARTBOARD_CENTER"       - Measures from center of artboard
//                           Object's center will be placed at x,y from artboard center
//
// "OBJECT_CENTER"         - Places object's center at x,y from artboard top-left
//                           Useful for centering objects at specific positions
//
// "OBJECT_TOP_LEFT"       - Places object's top-left corner at x,y from artboard top-left
//                           Same as ARTBOARD_ORIGIN
//
// "OBJECT_BOTTOM_CENTER"  - Places object's bottom-center at x,y from artboard top-left
//                           Useful for aligning objects by their bottom edge
//
// ========================================

// Unit conversion constants
// 1 point = 1/72 inch, 1 inch = 2.54 cm, 1 point = 2.54/72 cm
var PT_TO_CM = 2.54 / 72;  // = 0.03527777... cm per point
var CM_TO_PT = 72 / 2.54;  // = 28.34645669... points per cm

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
    // Get current dimensions using geometric bounds
    var bounds = item.geometricBounds; // [left, top, right, bottom]
    var currentWidth = bounds[2] - bounds[0];
    var currentHeight = bounds[1] - bounds[3];

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

    // Resize using the resize method with top-left anchor point
    // This gives precise control over the transformation
    item.resize(scaleFactor * 100, scaleFactor * 100, true, true, true, true, scaleFactor * 100, Transformation.TOPLEFT);

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

    // Use geometric bounds for precise positioning
    var bounds = item.geometricBounds; // [left, top, right, bottom]
    var itemWidth = bounds[2] - bounds[0];
    var itemHeight = bounds[1] - bounds[3];

    var targetLeft, targetTop;

    switch(referencePoint) {
        case "ARTBOARD_ORIGIN":
            // Position from top-left corner of artboard (object's top-left at x,y from artboard origin)
            targetLeft = artboardLeft + xPt;
            targetTop = artboardTop - yPt;
            break;

        case "ARTBOARD_CENTER":
            // Position from center of artboard (object's center at x,y from artboard center)
            targetLeft = artboardCenterX + xPt - (itemWidth / 2);
            targetTop = artboardCenterY - yPt + (itemHeight / 2);
            break;

        case "OBJECT_CENTER":
            // Place object's center at x,y from artboard top-left
            targetLeft = artboardLeft + xPt - (itemWidth / 2);
            targetTop = artboardTop - yPt + (itemHeight / 2);
            break;

        case "OBJECT_TOP_LEFT":
            // Place object's top-left at x,y from artboard top-left
            targetLeft = artboardLeft + xPt;
            targetTop = artboardTop - yPt;
            break;

        case "OBJECT_BOTTOM_CENTER":
            // Place object's bottom-center at x,y from artboard top-left
            targetLeft = artboardLeft + xPt - (itemWidth / 2);
            targetTop = artboardTop - yPt + itemHeight;
            break;

        default:
            // Default to artboard origin if unknown reference point
            targetLeft = artboardLeft + xPt;
            targetTop = artboardTop - yPt;
            break;
    }

    // Calculate the translation needed
    var deltaX = targetLeft - bounds[0];
    var deltaY = targetTop - bounds[1];

    // Move the item precisely using translate
    item.translate(deltaX, deltaY);
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
    var dialog = new Window("dialog", "Resize and Position Logo");
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
    var infoText = dialog.add("statictext", undefined, "This will automatically resize and position the selected logo.");
    infoText.preferredSize = [350, 40];
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
            resultDialog.orientation = "column"; // Orientation is not deprecated, this is an ExtendScript Window, not a browser Window
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