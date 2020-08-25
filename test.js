const testArray = (123, 34, 5432, 86, 34);

let maptest = testArray.map((num) => num *2);
let filtertest = testArray.filter((num) => {
    if(num % 2 == 0) return true;
    return false;
});
let reducetest = testArray.reduce((acc, cur) => acc + cur);

const coolButton = document.createElement("button");
coolButton.addEventListener('click', () => {
    console.time()
    for(let i = 0; i < 100; i++) console.log("really cool button");
    console.timeEnd();
});

console.table(["mario", "luigi", "waluigi"]);