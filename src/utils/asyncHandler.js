
const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).reject((err) => next(err))
    }
}


export {asyncHandler}

//try-catch method
// below thing is same as () => { ()=>{} }, we just ignore the outer curly braces and keep it simple ()=>()=>{}

// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
        
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }