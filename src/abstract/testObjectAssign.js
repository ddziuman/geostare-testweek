class SomeClass {
  constructor() {
    console.log(this.constructor.name);
  };

  toString() {
    return this.constructor.name;
  }
};
class InheritingClass extends SomeClass {
  constructor() {
    super();
  };
}

const instance = new InheritingClass();



const a = {
  func() {
    a = 5;
  }
}

