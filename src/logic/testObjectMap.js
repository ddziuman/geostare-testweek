const array = [{ a: 1 }, { a: 2 }, { a: 3 }];

const mappedArray = array.map((obj) => {
  const copyPlace = Object.assign({}, obj);
  copyPlace.a += obj.a;
  return copyPlace;
});

console.log(array);
console.log(mappedArray);