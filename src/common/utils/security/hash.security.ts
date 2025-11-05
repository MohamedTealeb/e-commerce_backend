import {compare , hash} from 'bcrypt'


export const generateHash=async(plaintext:string,salt_round:number=parseInt(process.env.BCRYPT_SALT_ROUNDS || '10')):Promise<string>=>{
    return await hash(plaintext,salt_round)
}

export const compareHash=async(plaintext:string,hash:string):Promise<boolean>=>{
    return await compare(plaintext,hash)
}