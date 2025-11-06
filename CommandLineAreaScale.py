import math

def resize_to_target_area(width_cm: float, height_cm: float, target_area_cm2: float = 40.0):
    """Resize a rectangle to have a target surface area (cm²) while maintaining aspect ratio."""
    current_area = width_cm * height_cm
    scale_factor = math.sqrt(target_area_cm2 / current_area)
    new_width = width_cm * scale_factor
    new_height = height_cm * scale_factor
    return new_width, new_height


def run_once(target_area_cm2, width_cm, height_cm):
    new_width, new_height = resize_to_target_area(width_cm, height_cm, target_area_cm2)

    print("\n================ Results =================")
    print(f"Target area: {target_area_cm2:.3f} cm²")
    print(f"Original dimensions: {width_cm:.3f} cm × {height_cm:.3f} cm")
    print(f"Original area: {width_cm * height_cm:.3f} cm²")
    print(f"Aspect ratio: {width_cm/height_cm:.3f}:1")
    print(f"\nNew dimensions: {new_width:.3f} cm × {new_height:.3f} cm")
    print(f"New area: {new_width * new_height:.3f} cm²\n")


def main():
    print("==================== AreaScale ====================")
    print("Enter: <target_area_cm²> <width_cm> <height_cm>")
    print("Press Enter with no input to exit.\n")

    while True:
        user_input = input("> ").strip()
        if not user_input:
            print("Goodbye!")
            break

        parts = user_input.split()
        if len(parts) != 3:
            print("Error: Please enter exactly three numbers (target_area_cm² width_cm height_cm)")
            continue

        try:
            target_area_cm2, width_cm, height_cm = map(float, parts)
            if target_area_cm2 <= 0 or width_cm <= 0 or height_cm <= 0:
                print("Error: All values must be positive numbers")
                continue
            run_once(target_area_cm2, width_cm, height_cm)
        except ValueError:
            print("Error: Invalid numeric input.")


if __name__ == "__main__":
    main()
