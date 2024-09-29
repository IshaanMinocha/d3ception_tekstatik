import sys
import os
import json
import cv2
import numpy as np
from ultralytics import YOLO
import cvzone

def run_analysis(input_image_path):
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(current_dir, "best.pt")
        
        if not os.path.exists(model_path):
            return {"error": f"Model file not found at {model_path}"}
        
        model = YOLO(model_path)
        classes = ["door", "sofa", "dining-table", "bed", "window"]
        colors = [(0, 255, 0), (255, 0, 0), (0, 0, 255), (255, 255, 0), (0, 255, 255)]  # Green, Red, Blue, Yellow, Cyan

        if not os.path.exists(input_image_path):
            return {"error": f"Input image not found at {input_image_path}"}

        img = cv2.imread(input_image_path)

        if img is None:
            return {"error": f"Unable to read image at {input_image_path}"}
        
        results = model(img, stream=True)
        for result in results:
            boxes = result.boxes
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0]
                x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                clsint = int(box.cls[0])
                w, h = x2-x1, y2-y1
                color = colors[clsint]
                cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
                cv2.putText(img, classes[clsint], (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)

        # Create legend
        legend_height = len(classes) * 30 + 10
        legend_img = np.zeros((legend_height, 200, 3), dtype=np.uint8)
        legend_img.fill(255)  # White background
        for i, (cls, color) in enumerate(zip(classes, colors)):
            cv2.putText(legend_img, cls, (5, 30 * i + 25), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
            cv2.rectangle(legend_img, (150, 30 * i + 10), (180, 30 * i + 30), color, -1)

        # Combine original image and legend
        h, w = img.shape[:2]
        legend_h, legend_w = legend_img.shape[:2]
        combined_img = np.zeros((max(h, legend_h), w + legend_w, 3), dtype=np.uint8)
        combined_img.fill(255)  # White background
        combined_img[:h, :w] = img
        combined_img[:legend_h, w:] = legend_img

        output_path = os.path.join(current_dir, "output.png")
        cv2.imwrite(output_path, combined_img)
        
        return {"success": True, "output_path": output_path}
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        result = {"error": "No input image path provided"}
    else:
        input_image_path = sys.argv[1]
        result = run_analysis(input_image_path)
    
    print(json.dumps(result))
    sys.stdout.flush()