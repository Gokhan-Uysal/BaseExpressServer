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
    InternalServerError: Error("Server connection error"),
    ReachedRequestCallCount: (reqCount) => Error("Client reached request call count with count: " + reqCount),
    AuthenticationError: Error("Authentication failed")
}