import React from "react";
import { Easing, Animated } from "react-native";
import {
  createStackNavigator,
  createDrawerNavigator,
  createBottomTabNavigator,
  BottomTabBar,
  createAppContainer,
  createSwitchNavigator
} from "react-navigation";

import { Block } from "galio-framework";

// screens
import Home from "../screens/Home";
import Onboarding from "../screens/Onboarding";
import Pro from "../screens/Pro";
import Profile from "../screens/Profile";
import Register from "../screens/Register";
import Login from "../screens/Login";

import Elements from "../screens/Elements";
import Articles from "../screens/Articles";
import Post from "../screens/Post";
// drawer
import Menu from "./Menu";
import DrawerItem from "../components/DrawerItem";

// header for screens
import Header from "../components/Header";

import Icon from "../components/Icon";
import UpdateProfile from "../screens/UpdateProfile";
import AddPost from "../screens/AddPost";
import SearchUser from "../screens/SearchUser";
import userProfile from "../screens/userProfile";
import Maps from "../screens/Maps";

const TabBarComponent = props => <BottomTabBar {...props} />;

const transitionConfig = (transitionProps, prevTransitionProps) => ({
  transitionSpec: {
    duration: 400,
    easing: Easing.out(Easing.poly(4)),
    timing: Animated.timing
  },
  screenInterpolator: sceneProps => {
    const { layout, position, scene } = sceneProps;
    const thisSceneIndex = scene.index;
    const width = layout.initWidth;

    const scale = position.interpolate({
      inputRange: [thisSceneIndex - 1, thisSceneIndex, thisSceneIndex + 1],
      outputRange: [4, 1, 1]
    });
    const opacity = position.interpolate({
      inputRange: [thisSceneIndex - 1, thisSceneIndex, thisSceneIndex + 1],
      outputRange: [0, 1, 1]
    });
    const translateX = position.interpolate({
      inputRange: [thisSceneIndex - 1, thisSceneIndex],
      outputRange: [width, 0]
    });

    const scaleWithOpacity = { opacity };
    const screenName = "Search";

    if (
      screenName === transitionProps.scene.route.routeName ||
      (prevTransitionProps &&
        screenName === prevTransitionProps.scene.route.routeName)
    ) {
      return scaleWithOpacity;
    }
    return { transform: [{ translateX }] };
  }
});

const ElementsStack = createStackNavigator({
  Elements: {
    screen: Elements,
    navigationOptions: ({ navigation }) => ({
      header: <Header title="Elements" navigation={navigation} />
    })
  }
},{
  cardStyle: {
    backgroundColor: "#FFFFFF"
  },
  transitionConfig
});

const ArticlesStack = createStackNavigator({
  Articles: {
    screen: Articles,
    navigationOptions: ({ navigation }) => ({
      header: <Header title="Articles" navigation={navigation} />
    })
  }
},{
  cardStyle: {
    backgroundColor: "#FFFFFF"
  },
  transitionConfig
});


const MapStack = createStackNavigator({
  Maps: {
    screen: Maps,
    navigationOptions: ({ navigation }) => ({
      header: <Header title="Maps" navigation={navigation} />
    })
  }
},{
  cardStyle: {
    backgroundColor: "#FFFFFF"
  },
  transitionConfig
});

const ProfileStack = createStackNavigator(
  {
    Profile: {
      screen: Profile,
      navigationOptions: ({ navigation }) => ({
        header: (
          <Header title="Profile" iconColor={'#FFF'} navigation={navigation} />
        ),
        headerTransparent: true
      })
    },
    
    Post: {
      screen: Post,
      navigationOptions: ({ navigation }) => ({
        header: (
          <Header title="Post" back iconColor={'#FFF'} navigation={navigation} />
        ),
        headerTransparent: false
      })
    },
    
    Update: {
      screen: UpdateProfile,
      navigationOptions: ({ navigation }) => ({
        header: (
          <Header title="Update" back iconColor={'#FFF'} navigation={navigation} />
        ),
        headerTransparent: false
      })
    }
  },
  {
    cardStyle: { backgroundColor: "#FFFFFF" },
    transitionConfig
  }
);



const LoginStack = createStackNavigator(
  {
    Login: {
      screen: Login,
      navigationOptions: ({ navigation }) => ({
        header: (
          <Header title="Profile" iconColor={'#FFF'} navigation={navigation} />
        ),
        headerTransparent: true
      })
    }
  
    }
);

const RegisterStack = createStackNavigator(
  {
    Register: {
      screen: Register,
      navigationOptions: ({ navigation }) => ({
        header: (
          <Header title="Profile" iconColor={'#FFF'} navigation={navigation} />
        ),
        headerTransparent: true
      })
    }
  
    }
);
 const UpdateStack = createStackNavigator(
  {
    Register: {
      screen: UpdateProfile,
      navigationOptions: ({ navigation }) => ({
        header: (
          <Header title="Update" iconColor={'#FFF'} navigation={navigation} />
        ),
        // headerTransparent: true
      })
    }
  
    }
);
 const AddPostStack = createStackNavigator(
  {
    AddPost: {
      screen: AddPost,
      navigationOptions: ({ navigation }) => ({
        header: (
          <Header title="New Post" iconColor={'#FFF'} navigation={navigation} />
        ),
         headerTransparent: false
      })
    }
  
    }
);
 const SearchUserStack = createStackNavigator(
  {
    SearchUser: {
      screen: SearchUser,
      navigationOptions: ({ navigation }) => ({
        header: (
          <Header title="Users"  iconColor={'#FFF'} navigation={navigation} />
        ),
         headerTransparent: false
      })
    },
    userPost: {
      screen: Post,
      navigationOptions: ({ navigation }) => ({
        header: (
          <Header title="Post" back iconColor={'#FFF'} navigation={navigation} />
        ),
        headerTransparent: false
      })
    },
    userProfile: {
      screen: userProfile,
      navigationOptions: ({ navigation }) => ({
        header: (
          <Header title="Profile" back  iconColor={'#FFF'} navigation={navigation} />
        ),
         headerTransparent: true
      })
    }
  
    }
);




const HomeStack = createStackNavigator(
  {
    Home: {
      screen: Home,
      navigationOptions: ({ navigation }) => ({
        header: <Header title="Home" navigation={navigation} />
      })
    },
    Pro: {
      screen: Pro,
      navigationOptions: ({ navigation }) => ({
        header: (
          <Header left={<Block />} white transparent title="" navigation={navigation} />
        ),
        headerTransparent: true
      })
    }
  },
  {
    cardStyle: {
      backgroundColor: "#FFFFFF"
    },
    transitionConfig
  }
);


export const SignedIn = createBottomTabNavigator({
  Home: { 
    screen: HomeStack,
    navigationOptions:{
      // tabBarLabel: 'Home',
      tabBarIcon:({tintColor}) => (
        <Icon
      
      family="AntDesign"
      size={20}
      color={tintColor}
      name="home"
        />
      )
    }
  },
  Maps: { 
    screen: MapStack,
    navigationOptions:{
      // tabBarLabel: 'Home',
      tabBarIcon:({tintColor}) => (
        <Icon
      
      family="Feather"
      size={20}
      color={tintColor}
      name="map"
        />
      )
    }
  },
  Profile:{ 
    screen: ProfileStack,
    navigationOptions:{
      // tabBarLabel: 'Profile',
      tabBarIcon:({tintColor}) => (
        <Icon
      
      family="AntDesign"
      size={20}
      color={tintColor}
      name="user"
        />
      )
    }
  },
  Update:{ 
    screen: UpdateStack,
    navigationOptions:{
      // tabBarLabel: 'Update',
      tabBarIcon:({tintColor}) => (
        <Icon
      
      family="AntDesign"
      size={20}
      color={tintColor}
      name="user"
        />
      )
    }
  },
  AddPost:{ 
    screen: AddPostStack,
    navigationOptions:{
      // tabBarLabel: 'Add Post',
      tabBarIcon:({tintColor}) => (
        <Icon
      
      family="AntDesign"
      size={20}
      color={tintColor}
      name="camera"
        />
      )
    }
  },
  SearchUser:{ 
    screen: SearchUserStack,
    navigationOptions:{
      // tabBarLabel: 'Add Post',
      tabBarIcon:({tintColor}) => (
        <Icon
      
      family="AntDesign"
      size={20}
      color={tintColor}
      name="search1"
        />
      )
    }
  },
 

  // Account:{ 
  //   screen: LoginStack,
  //   navigationOptions:{
  //     tabBarLabel: 'Login',
  //     tabBarIcon:({tintColor}) => (
  //       <Icon
      
  //     family="AntDesign"
  //     size={20}
  //     color={tintColor}
  //     name="profile"
  //       />
  //     )
  //   }
  // },
  // AccountRegister:{ 
  //   screen: RegisterStack,
  //   navigationOptions:{
  //     tabBarLabel: 'Sign Up',
  //     tabBarIcon:({tintColor}) => (
  //       <Icon
      
  //     family="AntDesign"
  //     size={20}
  //     color={tintColor}
  //     name="profile"
  //       />
  //     )
  //   }
  // },
  // Elements:{ 
  //   screen: ElementsStack,
  //   navigationOptions:{
  //     tabBarLabel: 'Elements',
  //     tabBarIcon:({tintColor}) => (
  //       <Icon
      
  //     family="Feather"
  //     size={20}
  //     color={tintColor}
  //     name="list"
  //       />
  //     )
  //   }
  // },
  // Articles: { 
  //   screen: ArticlesStack,
  //   navigationOptions:{
  //     tabBarLabel: 'Articles',
  //     tabBarIcon:({tintColor}) => (
  //       <Icon
      
  //     family="Entypo"
  //     size={20}
  //     color={tintColor}
  //     name="documents"
  //       />
  //     )
  //   }
  // }
},{
  order:['Home', 'SearchUser', 'AddPost', 'Maps' ,'Profile'],
  animationEnabled: true,
  initialRouteName: 'Home',
  navigationOptions:{
    tabBarVisible: true
  },
  tabBarOptions: {
    activeTintColor: 'tomato',
    inactiveTintColor: 'gray',
  },
  tabBarComponent: props => (
    <TabBarComponent {...props} style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20, borderTopColor:"whitesmoke", backgroundColor:"whitesmoke", overflow:'hidden' }} />
  ),
}
);


// const AppContainer = createAppContainer(AppStack);
// export default AppContainer;
