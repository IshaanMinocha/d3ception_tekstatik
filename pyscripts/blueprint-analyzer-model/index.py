import cv2 
from ultralytics import YOLO
import cvzone

model = YOLO("best.pt")
classes = ["door", "sofa", "dining-table", "bed", "window"]
img = cv2.imread("pop.png")
results = model(img, stream=True)
for result in results:
	boxes = result.boxes
	for box in boxes:
		x1, y1, x2, y2 = box.xyxy[0]
		x1, y1, x2, y2  = int(x1), int(y1), int(x2), int(y2)
		clsint = int(box.cls[0])
		w, h = x2-x1, y2-y1
		cvzone.cornerRect(img, (x1,y1,w,h))
cv2.imshow("Image", img)
cv2.waitKey(0)