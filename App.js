import React from 'react';
import { Image, AsyncStorage} from 'react-native';
import { AppLoading, Asset } from 'expo';
import { Block, GalioProvider } from 'galio-framework';

// import Screens from './navigation/Router';
import CheckScreens from './navigation/CheckScreens';
import { Images, articles, argonTheme } from './constants';
import {isUserSignedIn} from './services/auth.service';
import {firebase} from './services/firebase';

import Screens, { AppStack } from './navigation/Router';
// import SyncScreen from './navigation/Router';
import { createAppContainer } from 'react-navigation';

// cache app images
const assetImages = [
  Images.Onboarding,
  Images.LogoOnboarding,
  Images.Logo,
  Images.Pro,
  Images.ArgonLogo,
  Images.iOSLogo,
  Images.androidLogo
];


// cache product images
articles.map(article => assetImages.push(article.image));

function cacheImages(images) {
  return images.map(image => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}




export default class App extends React.Component {
  state = {
    isLoadingComplete: false,
    signedIn: false,
    
  }
  componentWillMount=async()=>{
    try {
          let userData = await AsyncStorage.getItem("userData");
          let data = JSON.parse(userData);
          //  console.log(data);
          if (data!=null){
            this.setState({signedIn: true})
          }else{
            this.setState({signedIn: false})
          }
        } catch (error) {
          console.log("Something went wrong", error);
        }
  }

  render() {
    const Layout = AppStack(this.state.signedIn);
    const Applayout = createAppContainer(Layout); 
    if(!this.state.isLoadingComplete) {

      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      );
    } else{
      return (
        <GalioProvider theme={argonTheme}>
          <Block flex>
            <Applayout  />
            {/* <SyncScreen/> */}
          </Block>
        </GalioProvider>
      );
    }
  }


  _loadResourcesAsync = async () => {
     return Promise.all([
      ...cacheImages(assetImages),
    ]);
  };

  _handleLoadingError = error => {
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };

}
