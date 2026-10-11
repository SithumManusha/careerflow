import os
import sys
import shutil
import cv2

def convert_webm_to_mp4(webm_path, mp4_path):
    print(f"Reading WebM source: {webm_path}")
    if not os.path.exists(webm_path):
        print(f"Error: {webm_path} does not exist!")
        return False

    cap = cv2.VideoCapture(webm_path)
    if not cap.isOpened():
        print(f"Error: Cannot open video file {webm_path}")
        return False

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    print(f"Source video details: {width}x{height} @ {fps:.1f} fps, {total_frames} frames")

    # Use mp4v codec for universal playback on Windows, Mac, and LinkedIn
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(mp4_path, fourcc, fps, (width, height))

    frame_count = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        out.write(frame)
        frame_count += 1
        if frame_count % 200 == 0:
            print(f"Converted {frame_count}/{total_frames} frames ({frame_count * 100 // (total_frames or 1)}%)...")

    cap.release()
    out.release()

    size_mb = os.path.getsize(mp4_path) / (1024 * 1024)
    print(f"Successfully created MP4: {mp4_path} ({size_mb:.2f} MB, {frame_count} frames)")
    return True

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(base_dir, "output_videos")
    webm_file = os.path.join(output_dir, "careerflow_human_demo.webm")

    desktop_dir = os.path.join(os.path.expanduser("~"), "Desktop")
    desktop_mp4 = os.path.join(desktop_dir, "careerflow_linkedin_demo.mp4")
    desktop_webm = os.path.join(desktop_dir, "careerflow_linkedin_demo.webm")

    artifact_dir = r"C:\Users\VICTUS\.gemini\antigravity\brain\c9ac2835-252d-4735-87d0-cbe4b8244e89"
    artifact_mp4 = os.path.join(artifact_dir, "careerflow_linkedin_demo.mp4")
    artifact_webm = os.path.join(artifact_dir, "careerflow_linkedin_demo.webm")

    if convert_webm_to_mp4(webm_file, desktop_mp4):
        # Also copy webm to desktop
        shutil.copyfile(webm_file, desktop_webm)
        print(f"Copied WebM to Desktop: {desktop_webm}")

        # Sync to artifacts directory
        if os.path.exists(artifact_dir):
            shutil.copyfile(desktop_mp4, artifact_mp4)
            shutil.copyfile(desktop_webm, artifact_webm)
            print(f"Synced video to Artifacts: {artifact_mp4}")
        print("ALL VIDEO PROCESSING FINISHED SUCCESSFULLY!")
    else:
        sys.exit(1)
