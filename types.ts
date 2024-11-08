import {ObjectId,OptionalId}from "mongodb"


export type Persona={
    nombre:string,
    email:string,
    telefono:string,
    amigos:string[],
}

export type PersonaModel =OptionalId<{
    nombre:string,
    email:string,
    telefono:string,
    amigos:ObjectId[],
}>