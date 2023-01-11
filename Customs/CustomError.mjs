export const CustomError = {
    DbItemNotFound : (item) =>{
        return Error("Requested " + item +" not found")
    },
    DbItemAlreadyExists: (item) =>{
        return Error("Requested "+ item +" already exists")
    },
    UserPropertyNotFound: (property) =>{
        return Error("User "+ property +" not found")
    },
    EmailPropertyNotFound: (property) =>{
        return Error("Email "+ property +" not found")
    },
    ReachedRequestCallCount: (reqCount) => Error("Client reached request call count with count: " + reqCount),
    InternalServerError: Error("Server connection error"),
    AuthenticationError: Error("Authentication failed")
}