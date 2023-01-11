import bcrypt from "bcrypt"

export class PasswordHelper{

    constructor(saltRounds){
        let allChars = [];
        let allSymbols = [];

        for (let i=97; i<123; i++){
            allChars.push(String.fromCharCode(i));
        }
        for(let i=33; i<65; i++){
            allSymbols.push(String.fromCharCode(i))
        }

        this.getAllChars = () =>{return allChars}
        this.getAllSymbols = () =>{return allSymbols}
        this.saltRounds = saltRounds
    }
    async hashPassword(password){
        let hashedPassword = await bcrypt.hash(password, this.saltRounds)
        return hashedPassword
    }

    async comparePassword(password, hashedPassword){
        return await bcrypt.compare(password, hashedPassword)
    }

    createPassword(){
        let length =parseInt(Math.random() * 10 + 20)
        let password = ""
        for (let i = 0; i < length; i++){
            let change = parseInt(Math.random() * 2)
            switch (change){
                case 0:
                    password += this.getRandomChar()
                    break
                case 1:
                    password += this.getRandomSymbol()
                    break
                default:
                    throw SyntaxError
            }
        }
        return password
    }

    getRandomChar(){
        let index = parseInt(Math.random() * this.getAllChars().length + 1)
        return this.getAllChars()[index]
    }

    getRandomSymbol(){
        let index = parseInt(Math.random() * this.getAllSymbols().length + 1)
        return this.getAllSymbols()[index]
    }
}
