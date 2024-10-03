export interface User
{
    id: string,
    birthdate: Date,
    createdAt: Date,
    email: string,
    gender: string,
    search: string
}

export interface Meeting
{
    date: Date
    orientation: string,
    region: string,
    age: string,
    participants: User[]
}