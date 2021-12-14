const fractalButton = document.getElementById('fractal-button');
const colorSchemeButton = document.getElementById('color-scheme-button');
const affineTransformationsButton = document.getElementById('affine-transformations-button');
const fractalHeader = document.getElementById('fractal');
const colorSchemeHeader = document.getElementById('color-scheme');
const affineTransformationsHeader = document.getElementById('affine-transformations');

fractalButton.addEventListener('click', () => {
  scrollToElement(fractalHeader);
});

colorSchemeButton.addEventListener('click', () => {
  scrollToElement(colorSchemeHeader);
});

affineTransformationsButton.addEventListener('click', () => {
  scrollToElement(affineTransformationsHeader);
});

function scrollToElement(e) {
  scrollTo({
    behavior: 'smooth',
    top: e.offsetTop
  });
}