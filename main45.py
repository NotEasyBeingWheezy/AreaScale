import sys
import math

def resize_to_target_area(width_mm, height_mm, target_area=4500):
    """
    Resize a rectangle to have a target surface area while maintaining aspect ratio.
    
    Args:
        width_mm: Original width in millimeters
        height_mm: Original height in millimeters
        target_area: Target surface area in square millimeters (default 4500)
    
    Returns:
        tuple: (new_width, new_height) in millimeters
    """
    # Calculate the scaling factor
    current_area = width_mm * height_mm
    scale_factor = math.sqrt(target_area / current_area)
    
    # Apply scaling to maintain aspect ratio
    new_width = width_mm * scale_factor
    new_height = height_mm * scale_factor
    
    return new_width, new_height

def main():
    if len(sys.argv) != 3:
        print("Usage: python resize_shape.py <width_mm> <height_mm>")
        print("Example: python resize_shape.py 20 10")
        sys.exit(1)
    
    try:
        width = float(sys.argv[1])
        height = float(sys.argv[2])
        
        if width <= 0 or height <= 0:
            print("Error: Width and height must be positive numbers")
            sys.exit(1)
        
        new_width, new_height = resize_to_target_area(width, height, target_area=4500)
        
        print(f"Original dimensions: {width:.3f} mm × {height:.3f} mm")
        print(f"Original area: {width * height:.3f} mm²")
        print(f"Aspect ratio: {width/height:.3f}:1")
        print(f"\nNew dimensions: {new_width:.3f} mm × {new_height:.3f} mm")
        print(f"New area: {new_width * new_height:.3f} mm²")
        
    except ValueError:
        print("Error: Please provide valid numeric values for width and height")
        sys.exit(1)

if __name__ == "__main__":
    main()