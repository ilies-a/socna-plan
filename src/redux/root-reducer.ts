import { combineReducers } from "redux";
import planReducer from "./plan/plan.reducer";

const rootReducer = combineReducers({
    plan: planReducer,
});

export default rootReducer;
