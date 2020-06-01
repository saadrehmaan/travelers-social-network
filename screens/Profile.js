import React from "react";
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  ImageBackground,
  Platform,
  Alert,
  AsyncStorage
} from "react-native";
import { Block, Text, theme } from "galio-framework";

import { Button } from "../components";
import { Images, argonTheme } from "../constants";
import { HeaderHeight } from "../constants/utils";
import * as firebase from 'firebase';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import { TouchableOpacity } from "react-native-gesture-handler";
import { logOut } from "../services/auth.service";
// import { getPosts } from "../constants/Images";



const { width, height } = Dimensions.get("screen");

const thumbMeasure = (width - 48 - 32) / 2;
// const userID = firebase.auth().currentUser.uid;

class Profile extends React.Component {
  

  user = firebase.auth().currentUser;
  firestoreUserRef = firebase.firestore().collection("users").doc(this.user.uid);
  firestoreFollowingRef = firebase.firestore().collection("following").doc(this.user.uid)
  .collection("userFollowing");

  state = {
    profilePic: Images.ProfilePicture,
    username: "",
    bio:"",
    name:"",
    email: "",
    posts:[],
    postCount: 0,
    followedUsers: 0
  };


 //AsynchStorage for pre loggin for already logged in users
 async storeToken(user) {
  try {
     await AsyncStorage.setItem("userData", JSON.stringify(user));
  } catch (error) {
    console.log("Something went wrong", error);
  }
}


  chooseProfilePicture= async () => {
    const selection = await new Promise((resolve) => {
      const title = 'Profile Picture!';
      const message = 'Do you want to update Profile Picture!';
      const buttons = [
          { text: 'Update Photo', onPress: () => resolve('Upload') },
          { text: 'Remove Photo', onPress: () => resolve('Remove') },
          { text: 'Cancel', onPress: () => resolve(null) }
      ];
      Alert.alert(title, message, buttons);
      })
      if (selection=="Upload") {

        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.1
        });
        
        // console.log(result);

        if (!result.cancelled) {
          
          this.uploadProfilePicture(result.uri, "("+this.user.uid+")ProfilePic")
          .then(()=>{
            this.setState({ profilePic: result.uri });
            this.storeProfilePictureToken(result.uri);
          }).catch((error)=>{
            console.log(error);
          })
        }
      }
      else if (selection=="Remove") {
        // 1. Firebase removal
          firebase.storage().ref().child("profilePics/("+this.user.uid+")ProfilePic").delete().then(
            async ()=>{    
        // 2. State Removal
              this.setState({ profilePic: Images.ProfilePicture });

        // 3. Local Storage Removal
              await AsyncStorage.removeItem("userProflePic("+this.user.uid+")").then(
                ()=>{
                  alert("Your Profile Photo has been removed!");
                }
              ).catch((error)=>{
                alert(error);
              })         
            }
          ).catch((error)=>{
            alert(error);
          })
      }
};

  
  // Storing the profile picture of logged user in local storage
  async storeProfilePictureToken(imageUri) {
    try {
       await AsyncStorage.setItem("userProflePic("+this.user.uid+")", JSON.stringify(imageUri));
    } catch (error) {
      console.log("Something went wrong", error);
    }
  }
 
  // Check wether the user has previously added any profile picture
   componentWillMount = async()=>{

    this.getFollowedUsers();
    try {
          let userProfilePic = await AsyncStorage.getItem("userProflePic("+this.user.uid+")");
          let profilePicData = JSON.parse(userProfilePic);
          let userInfo = await AsyncStorage.getItem("userData");
          let userData = JSON.parse(userInfo);

         
          //  console.log(profilePicData);
          if(userData!=null){
           
           this.setState({
            username: userData.username,
            bio: userData.bio,
            name: userData.name,
            email: userData.email
            });
            // console.log(this.state)

          }
          // if its present in local storage
          if (profilePicData!==null){
            this.setState({profilePic: profilePicData});
            console.log(profilePicData);

          }
          else  // checking if its present on firebase storage then put it in local storage and state
          {
            const firebaseProfilePic = firebase.storage().ref().child("profilePics/("+this.user.uid+")ProfilePic");
            firebaseProfilePic.getDownloadURL().then((url)=> {
              console.log(url);
              // Inserting into an State and local storage incase new device:
            this.setState({profilePic: url});
            this.storeProfilePictureToken(url);

            }).catch((error) => {
              // Handle any errors
              switch (error.code) {
                case 'storage/object-not-found':
                  // File doesn't exist
                  this.setState({profilePic: Images.ProfilePicture}) 
                  break;
                }
              alert(error);
            });
          }
        } catch (error) {
          console.log("Something went wrong", error);
        }
  }


  // Get all the users the current user is following
getFollowedUsers = () => {
   this.firestoreFollowingRef.get().then((querySnapshot)=>{
     let num = querySnapshot.size;
    //  console.log(num);
  this.setState({followedUsers: num});
  });

}


  uploadProfilePicture = async (uri, imageName)=>{
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const ref = firebase.storage().ref().child("profilePics/"+ imageName);
      return ref.put(blob);
  }


getRealTimeUpdates= ()=>{
  this.firestoreUserRef.onSnapshot((doc)=>{
    const res =  doc.data();
    this.storeToken(res);
    // let userInfo = await AsyncStorage.getItem("userData");
    // let userData = JSON.parse(userInfo); 

    this.setState({
      username: res.username,
      bio: res.bio,
      name: res.name,
      email: res.email
      });
    // console.log(res);
  })
}

getPosts = ()=> {
  var cloudImages= [];
  firebase.firestore().collection("posts").doc(firebase.auth().currentUser.uid)
    .collection("userPosts").orderBy("time", "desc").onSnapshot((snapshot) => {
      cloudImages= [];
      snapshot.forEach((doc) => {
        
        cloudImages.push(doc.data());
      });
      
//  console.log(cloudImages);
 this.setState({posts: cloudImages.map(post => post)});
 this.setState({postCount: this.state.posts.length});
    })
}

 componentDidMount() {

 

  // this.getPosts().then((res)=>{
  //   console.log(res);
  //   this.setState({posts: res.map(post => post)});
  
  // }).catch((err)=>{console.log(err)})
  this.getPosts();

  this.getRealTimeUpdates();
    this.getPermissionAsync();
  }
  

  
  getPermissionAsync = async () => {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    }
  }


  render() {
    let { profilePic } = this.state;
    
    return (
      
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ width, marginTop: '10%' }}
            >
              <Block style={styles.profileCard}>
              <Block    middle
                    row
                    space="evenly"
                    style={{  paddingBottom: 24 }}>
                <Block middle style={styles.avatarContainer}>
                  <TouchableOpacity onLongPress={this.chooseProfilePicture}>
                  <Image
                    source={{ uri: profilePic }}
                    style={styles.avatar}
                    onLong
                  />
                  </TouchableOpacity>
                </Block>
                
                  
                    <Block>
                    <Button
                      small
                      shadowless = {false}
                      icon="edit"
                      iconFamily="AntDesign"
                      style={{marginTop: 20, backgroundColor: '#87888a' }}
                      onPress={()=>this.props.navigation.navigate("Update")}
                    >
                      UPDATE PROFILE
                    </Button>
                  </Block>
                  </Block>
                  <Block style={styles.info}>
                  <Block row space="between">
                    <Block middle>
                      <Text
                        bold
                        size={12}
                        color="#525F7F"
                        style={{ marginBottom: 4 }}
                      >
                        3
                      </Text>
                      <Text size={12}>Followers</Text>
                    </Block>
                    <Block middle>
                      <Text
                        bold
                        color="#525F7F"
                        size={12}
                        style={{ marginBottom: 4 }}
                      >
                        {this.state.followedUsers}
                      </Text>
                      <Text size={12}>Following</Text>
                    </Block>
                    <Block middle>
                      <Text
                        bold
                        color="#525F7F"
                        size={12}
                        style={{ marginBottom: 4 }}
                      >
                        {this.state.postCount}
                      </Text>
                      <Text size={12}>Posts</Text>
                    </Block>
                  </Block>
                </Block>
                <Block flex>
                  <Block middle style={styles.nameInfo}>
                    <Text bold size={28} color="#32325D">
                      {this.state.username}
                    </Text>
                    <Text size={16} color="#32325D" style={{ marginTop: 10 }}>
                      {this.state.name}
                    </Text>
                  </Block>
                  <Block middle style={{ marginTop: 30, marginBottom: 16 }}>
                    <Block style={styles.divider} />
                  </Block>
                  <Block middle>
                    <Text
                      size={16}
                      color="#525F7F"
                      style={{ textAlign: "center" }}
                    >
                      {this.state.bio}
                    </Text>
                    {/* <Button
                      color="transparent"
                      textStyle={{
                        color: "#233DD2",
                        fontWeight: "500",
                        fontSize: 16
                      }}
                    >
                      Show more
                    </Button> */}
                  </Block>
                  <Block
                    row
                    style={{ paddingVertical: 14, alignItems: "baseline" }}
                  >
                    <Text bold size={16} color="#525F7F">
                      Posts
                    </Text>
                  </Block>
                  <Block
                    row
                    style={{ paddingBottom: 20, justifyContent: "flex-end" }}
                  >
                    {/* <Button
                      small
                      color="transparent"
                      textStyle={{ color: "#5E72E4", fontSize: 12 }}
                    >
                      View all
                    </Button> */}
                  </Block>
                  <Block style={{ paddingBottom: -HeaderHeight * 2 }}>
                    <Block row space="between" style={{ flexWrap: "wrap" }}>
                    
                      {/* {Images.Viewed.map((img, imgIndex) => ( */}
                      {this.state.posts.map((post, postIndex) => (
                        <TouchableOpacity key={postIndex} onPress={()=>{
                          // console.log(post.image);
                          this.props.navigation.navigate("Post",{
                            username: this.state.username,
                            title: "",
                            avatar: this.state.profilePic,
                            image: post.image,
                            cta: 'View article', 
                            caption: post.caption,
                            location: post.location.locationName,
                            postId: post.postId,
                            userId: post.userId
                          })}
                          }>
                        <Image
                          source={{ uri: post.image }}
                          key={`viewed-${post.image}`}
                          resizeMode="cover"
                          style={styles.thumb}
                        />
                        </TouchableOpacity>
                      ))}
                    </Block>
                  </Block>
                </Block>
                <Block row style={{alignItems: "center"}}>
                <Button  style={{width: 100, height: 50}}round size="small" color="#50C7C7" onPress={()=>{logOut(); this.props.navigation.navigate("SignedOut");}}>
            Log Out
          </Button>
          </Block>
              </Block>
              
            </ScrollView>
      
    );
  }
}

const styles = StyleSheet.create({
  profile: {
    marginTop: Platform.OS === "android" ? -HeaderHeight : 0,
    // marginBottom: -HeaderHeight * 2,
    flex: 1
  },
  profileContainer: {
    width: width,
    height: height,
    padding: 0,
    zIndex: 1
  },
  profileBackground: {
    width: width,
    height: height / 2
  },
  profileCard: {
    // position: "relative",
    padding: theme.SIZES.BASE,
    marginHorizontal: theme.SIZES.BASE,
    marginTop: 65,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: theme.COLORS.WHITE,
    // shadowColor: "black",
    // shadowOffset: { width: 0, height: 0 },
    // shadowRadius: 8,
    // shadowOpacity: 0.2,
    zIndex: 2
  },
  info: {
    paddingHorizontal: 40
  },
  avatarContainer: {
    position: "relative"
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 0
  },
  nameInfo: {
    marginTop: 35
  },
  divider: {
    width: "90%",
    borderWidth: 1,
    borderColor: "#E9ECEF"
  },
  thumb: {
    borderRadius: 4,
    marginVertical: 4,
    alignSelf: "center",
    width: thumbMeasure,
    height: thumbMeasure
  }
});

export default Profile;
