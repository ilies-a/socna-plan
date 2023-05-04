import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../../redux/store';

type ReduxWrapperProps = {
    children: JSX.Element,
};


const ReduxWrapper:React.FC<ReduxWrapperProps> = ({children}) => (
    <Provider store={store}>
        {children}
    </Provider>
);

export default ReduxWrapper;