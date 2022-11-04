export const uniqueArray = (val: any, index: number, self: Array<any>) => {
  return self.indexOf(val) === index;
};

export function getRandomFromArray<T>(arr: Array<T>) {
  const min = 0;
  const max = arr.length;
  const i = Math.floor(Math.random() * (max - min) + min);

  return {
    index: i,
    value: arr[i],
  };
}
