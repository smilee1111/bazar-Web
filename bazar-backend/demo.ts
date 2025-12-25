
let message: string = "Message";
console.log(message)

///message =10; error (changing data type)
message="New message"//data type must be same as defined above 

//Primitive data types: String, number, boolean , null, undefined, symbol, bigint
let num: number =42;
let isActive: boolean= true; 
let nullableValue: null = null;
let undedfinedValue: undefined = undefined;
let bigIntValue: bigint = 90071999999908n;
let symbolValue: symbol = Symbol("unique");

let anyValue: any = "Could be anything";
anyValue = 100;//No error 

let unknownValue: unknown = "could be anything too";
//unknownValue =unknwonValue +10; //Error

//Arrays
let numArr: number[] =[1,2,3];
//tuples
let tupleArr: [string, number]=["Age",30];


let id: string | number |boolean;
id ="Nipuana";
console.log(id)
id=30;
//id=true; //error


//Functions
function add(num1: number,num2: number):number{
    let sum: number = num1+num2;
    return sum;
}
let result: number=add(5,10);
console.log(result)



const info =(name: string | number):void => {
    console.log(name)
}
info('Hari')
info(24)

//Objects 
let userDetail: {name: string,age: number}={
    name:"Nipuana",
    age:24,
    //isActive: true//error
};
console.log(userDetail)

//Type interface
interface User{
    name: string;
    age: number;
    isActive?: boolean;//optional property

}
let user1: User ={
    name:"Hari",
    age:30
}

console.log(user1)

//Type Alias
type Point={
    x: number;
    y: number;
    desc?: string;
};

let point1: Point ={
    x:10,
    y:10,
    desc:"diaod"
};
console.log(point1)


//Generics <T>
//Specify type in placeholder
function identify<T>(arg: T):T{
    return arg;
}
let output1=identify<string>("Hello");
let output2=identify<number>(100);
console.log(output1,output2)

//ENUMS
enum Role{
    Admin,
    User,
    Guest
}
let userRole: Role = Role.Admin;
console.log(userRole)//index-0
console.log(Role[userRole])//vaue-Admin

interface Detail{
    id:number;
    name: string;
    role:Role;
}

let user2: Partial<Detail> ={
    role: Role.User
};

console.log(user2)

let user3: Readonly<Detail> ={
    id:1,
    name:"Nipuana",
    role: Role.Admin
};
//user2.name ="New name";//error
console.log(user3)