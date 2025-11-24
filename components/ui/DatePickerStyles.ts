export const datePickerStyles = `
.select-wrap {
  position: relative;
  height: 100%;
  text-align: center;
  overflow: hidden;
  font-size: 20px;
  color: #ddd;
}
.select-wrap:before, .select-wrap:after {
  position: absolute;
  z-index: 1;
  display: block;
  content: "";
  width: 100%;
  height: 50%;
  pointer-events: none;
}
.select-wrap:before {
  top: 0;
  background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0));
}
.select-wrap:after {
  bottom: 0;
  background-image: linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0));
}
.select-wrap .select-options {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 0;
  transform-style: preserve-3d;
  margin: 0 auto;
  display: block;
  transform: translateZ(-150px) rotateX(0deg);
  -webkit-font-smoothing: subpixel-antialiased;
  color: #666;
}
.select-wrap .select-options .select-option {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 50px;
  -webkit-font-smoothing: subpixel-antialiased;
}
/* Highlight */
.highlight {
  position: absolute;
  top: 50%;
  transform: translate(0, -50%);
  width: 100%;
  background-color: transparent;
  border-top: 1px solid rgba(255,255,255,0.2);
  border-bottom: 1px solid rgba(255,255,255,0.2);
  font-size: 24px;
  overflow: hidden;
  pointer-events: none;
}
.highlight-list {
  position: absolute;
  width: 100%;
}
.date-selector {
    perspective: 2000px;
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    width: 100%;
    height: 300px;
}
.date-selector > div {
    flex: 1;
}
`;