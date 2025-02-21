export const drawKeypoints = (ctx: CanvasRenderingContext2D, keypoints: any[]) => {
  keypoints.forEach((keypoint) => {
    ctx.beginPath();
    ctx.arc(keypoint[0], keypoint[1], 3, 0, 2 * Math.PI);
    ctx.fillStyle = '#00FFFF';
    ctx.fill();
  });
};

export const drawSkeleton = (ctx: CanvasRenderingContext2D, keypoints: any[]) => {
  const fingerPairs = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [0, 9], [9, 10], [10, 11], [11, 12],
    [0, 13], [13, 14], [14, 15], [15, 16],
    [0, 17], [17, 18], [18, 19], [19, 20]
  ];

  ctx.strokeStyle = '#00FFFF';
  ctx.lineWidth = 2;

  fingerPairs.forEach(([i, j]) => {
    ctx.beginPath();
    ctx.moveTo(keypoints[i][0], keypoints[i][1]);
    ctx.lineTo(keypoints[j][0], keypoints[j][1]);
    ctx.stroke();
  });
}; 