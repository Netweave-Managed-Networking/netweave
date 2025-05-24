export const isEqual = (
  obj1: Record<string, any>,
  obj2: Record<string, any>
): boolean => {
  if (obj1 === obj2) return true; // Same reference

  if (
    typeof obj1 !== 'object' ||
    typeof obj2 !== 'object' ||
    obj1 === null ||
    obj2 === null
  ) {
    return false; // Primitive values or one is null
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  return keys1.every(
    key => obj2.hasOwnProperty(key) && isEqual(obj1[key], obj2[key])
  );
};
