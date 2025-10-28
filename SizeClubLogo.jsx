// Adobe Illustrator Script: Resize Shape to Target Area
// This script resizes selected shapes to a target area while maintaining aspect ratio

// Configuration
var TARGET_AREA = 45; // Target area in square centimeters

function resizeToTargetArea(item, targetArea) {
    // Get current dimensions in points (Illustrator's unit)
    var currentWidth = item.width;
    var currentHeight = item.height;
    
    // Convert points to centimeters (1 point = 0.0352778 cm)
    var PT_TO_CM = 0.0352778;
    var CM_TO_PT = 1 / PT_TO_CM;
    
    var widthCM = currentWidth * PT_TO_CM;
    var heightCM = currentHeight * PT_TO_CM;
    
    // Calculate current area in cm²
    var currentArea = widthCM * heightCM;
    
    // Calculate scaling factor
    var scaleFactor = Math.sqrt(targetArea / currentArea);
    
    // Calculate new dimensions in cm
    var newWidthCM = widthCM * scaleFactor;
    var newHeightCM = heightCM * scaleFactor;
    
    // Convert back to points for Illustrator
    var newWidth = newWidthCM * CM_TO_PT;
    var newHeight = newHeightCM * CM_TO_PT;
    
    // Store the center point before resizing
    var centerX = item.left + (item.width / 2);
    var centerY = item.top - (item.height / 2);
    
    // Resize the item
    item.width = newWidth;
    item.height = newHeight;
    
    // Reposition to maintain center point
    item.left = centerX - (newWidth / 2);
    item.top = centerY + (newHeight / 2);
    
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
        alert("No shapes selected. *******");
        return;
    }
    
    // Ask user for target area (optional)
    var dialog = new Window("dialog", "Resize to Target Area");
    dialog.add("statictext", undefined, "Enter target area (cm²):");
    var areaInput = dialog.add("edittext", undefined, TARGET_AREA.toString());
    areaInput.characters = 10;
    dialog.add("statictext", undefined, "(Note: 50 cm² = 5000 mm²)");
    
    var buttonGroup = dialog.add("group");
    buttonGroup.add("button", undefined, "OK", {name: "ok"});
    buttonGroup.add("button", undefined, "Cancel", {name: "cancel"});
    
    if (dialog.show() === 1) {
        var targetArea = parseFloat(areaInput.text);
        
        if (isNaN(targetArea) || targetArea <= 0) {
            alert("Please enter a valid positive number for the target area.");
            return;
        }
        
        // Process each selected item
        var results = [];
        for (var i = 0; i < selection.length; i++) {
            var item = selection[i];
            
            // Only process items that have width and height properties
            if (item.width && item.height) {
                var result = resizeToTargetArea(item, targetArea);
                results.push(result);
            }
        }
        
        // Show results
        if (results.length > 0) {
            var message = "Resized " + results.length + " shape(s):\n\n";
            for (var j = 0; j < results.length; j++) {
                var r = results[j];
                message += "Shape " + (j + 1) + ":\n";
                message += "  Original: " + r.originalWidth.toFixed(2) + " × " + r.originalHeight.toFixed(2) + " cm (" + r.originalArea.toFixed(2) + " cm²)\n";
                message += "  New: " + r.newWidth.toFixed(2) + " × " + r.newHeight.toFixed(2) + " cm (" + r.newArea.toFixed(2) + " cm²)\n";
                message += "  Scale: " + (r.scaleFactor * 100).toFixed(2) + "%\n\n";
            }
            alert(message);
        } else {
            alert("No valid shapes were found in the selection.");
        }
    }
}

// Run the script
main();