import {SignedIn} from './Screens';
import {SignedOut} from "./CheckScreens"
import { createSwitchNavigator, createAppContainer } from 'react-navigation';


export const AppStack = (signedIn) => { return createSwitchNavigator({
    SignedIn : { screen: SignedIn},
    SignedOut : { screen: SignedOut}
  }
  ,
  {
    initialRouteName: signedIn ? "SignedIn" : "SignedOut"
  })};

  
// const AppContainer = (signedIn = false) => { return createAppContainer(AppStack)};
// export default AppContainer;
  
  