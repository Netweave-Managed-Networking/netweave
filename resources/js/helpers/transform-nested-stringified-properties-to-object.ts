/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * transforms `{ "a.b": 'a str' }` to `{ a: { b: 'a str' } }`
 * @param object
 */
export const transformNestedStringifiedPropertiesToObject = <ReturnType = object>(object: object): ReturnType => {
  return Object.entries(object).reduce(
    (acc: Record<string, any>, [key, value]) => {
      const keys = key.split('.'); // Split the key by dots
      let current = acc;

      // Iterate through all keys except the last one to build nested structure
      for (let i = 0; i < keys.length - 1; i++) {
        const part = keys[i];
        current[part] = current[part] || {}; // Ensure the nested object exists
        current = current[part]; // Move deeper into the nested object
      }

      // Assign the value to the last key
      current[keys[keys.length - 1]] = value;

      return acc;
    },
    {} as Record<string, any>,
  ) as ReturnType;
};
