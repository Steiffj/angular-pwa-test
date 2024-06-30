export function openPwaWindow(
  route: string,
  dimensions: { height: number; width: number }
) {
  window.open(
    `${window.location.origin}/${route}`,
    undefined,
    `height=${dimensions.height},width=${dimensions.width}`
  );
}
