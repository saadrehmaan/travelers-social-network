import React from 'react';
import { StyleSheet, Dimensions, ScrollView, AsyncStorage, RefreshControl} from 'react-native';
import { Block, theme } from 'galio-framework';

import { Card, Button } from '../components';
// import articles from '../constants/articles';
import { logOut } from '../services/auth.service';
import * as firebase from 'firebase';
import { Images } from '../constants';
import { FlatList } from 'react-native-gesture-handler';
const { width } = Dimensions.get('screen');


class Home extends React.Component {
  user = firebase.auth().currentUser;
  firestoreUsersRef = firebase.firestore().collection("users");
  firestorePostRef = firebase.firestore().collection("posts");
  firestoreFollowingRef = firebase.firestore().collection("following").doc(this.user.uid)
  .collection("userFollowing");


  
  state = {
    posts: [],
    userData: {},
    followedUsers: [],
    avatar:Images.ProfilePicture,
    refreshing: false,
    lastDoc: null,
    getNextPosts: false,
    lastDocArr: [],
    xyz: []
  };

  // componentWillMount= () =>{
  //   // this.getPosts();
  //   this.getProfilePic();
  //   this.getFollowedUsers();
  //   // this.getFollowingPosts();
  // }

  componentDidMount = ()=>{
    // this.getProfilePic();
    this.getFollowingPosts();
  }


// Get all the users the current user is following
getFollowedUsers = async() => {
  let users = [];
  await this.firestoreFollowingRef.get().then((querySnapshot)=>{
    querySnapshot.forEach((docSnap) =>{
      users.push(docSnap.id);
      
    });
  // this.setState({followedUsers: users});
  });
  this.setState({followedUsers: users});
  // console.log(this.state.followedUsers);

}

// Get all posts of each user and push them in a same array
getFollowingPosts = async()=>{
  
  // 1. Get all the users the current user is following
  await this.getFollowedUsers().then(async()=>{
  // console.log(this.state.followedUsers);

  let users = this.state.followedUsers;
  let allPosts =[];
  let lastDocArr = [];
  
  // 2. Get posts of each user seperately and putting them in one array.
  //  users.forEach(async (user) => {
     for(const user of users){

      let userObj = new Object();
      userObj.user = user;

    await this.getProfilePic(user).then(async()=>{
      
      // console.log("Avatar:" +this.state.avatar)
    await this.firestoreUsersRef.doc(user).get().then(async(document)=>{
      this.setState({userData: document.data()})

    const startQuery = this.firestorePostRef.doc(user).collection("userPosts").orderBy("time", "desc");

    await startQuery.get().then(async(snapshot) => {
        var lastVisible = snapshot.docs[snapshot.docs.length-1];
        //  this.setState({lastDoc: lastVisible.id});
        userObj.lastDoc = lastVisible.data().postId;
        
        lastDocArr.push(userObj);
        snapshot.forEach((doc) => {

          let article={
            username: this.state.userData.username,
            userId: user,
            title: "post",
            avatar: this.state.avatar,
            image: doc.data().image,
            cta: "cta", 
            caption: doc.data().caption,
            location: doc.data().location,
            postId: doc.data().postId,
            timeStamp: doc.data().time,
            horizontal: true
          }
          allPosts.push(article);
        });

      });
    
  
  // console.log(lastDocArr)
  this.setState({posts: allPosts});
  
  
    });
   
  });
    }
     this.setState({xyz: lastDocArr});
    
   });
   console.log(this.state.xyz);
  }



// Get More posts on scrolling posts of each user and push them in a same array
getMorePosts = async()=>{
  
  // console.log(this.state.followedUsers);

  let users = this.state.followedUsers;
  let allPosts =this.state.posts;
  let lastDocArr = this.state.xyz;
  let userObj = {};
  let currentUserObj = {};
  // 2. Get posts of each user seperately and putting them in one array.
  //  users.forEach(async (user) => {
     for(const user of users){
      console.log("PRE ARRAY:            "+ lastDocArr)

      userObj.user = user;
     lastDocArr.map((userObj) => {
       console.log(userObj)
         if (userObj.user == user) {
           currentUserObj = userObj;
            lastDocArr.pop();
          }
       });
       
       this.setState({lastDocArr: lastDocArr})
       console.log("NEW ARRAY:            "+ lastDocArr)
  
  let currentUserLastDoc = currentUserObj.lastDoc;
  console.log("Current USer Last DOc is: "+ currentUserLastDoc)
    await this.getProfilePic(user).then(async()=>{
      
      // console.log("Avatar:" +this.state.avatar)
    await this.firestoreUsersRef.doc(user).get().then(async(document)=>{
      this.setState({userData: document.data()})

    const nextQuery = this.firestorePostRef.doc(user).collection("userPosts").orderBy("time", "desc").limit(1).startAfter(currentUserLastDoc).limit(1);
    // console.log(document.data());

    await nextQuery.get().then(async(snapshot) => {
        var lastVisible = snapshot.docs[snapshot.docs.length-1];
         this.setState({lastDoc: lastVisible.id});
          userObj.lastDoc = lastVisible.data().postId;
         snapshot.forEach((doc) => {

          let article={
            username: this.state.userData.username,
            userId: user,
            title: "post",
            avatar: this.state.avatar,
            image: doc.data().image,
            cta: "cta", 
            caption: doc.data().caption,
            location: doc.data().location,
            postId: doc.data().postId,
            timeStamp: doc.data().time,
            horizontal: true
          }
          allPosts.push(article);
        });
        lastDocArr.push(userObj);

      });
    
      
  this.setState({posts: allPosts});
    });
   
  });
  // allPosts.sort(function(a,b){
  //   // Turn your strings into dates, and then subtract them
  //   // to get a value that is either negative, positive, or zero.
  //   return new Date(b.timeStamp) - new Date(a.timeStamp) ;
  // });
  
  // this.setState({posts: allPosts});
  // console.log(this.state.posts);
    }
    
    this.setState({xyz: lastDocArr});
    console.log(lastDocArr);
}





  getProfilePic = async(user) =>{
    const firebaseProfilePic = await firebase.storage().ref().child("profilePics/("+user+")ProfilePic");
    firebaseProfilePic.getDownloadURL().then((url)=> {
    
      // console.log("got profile pic of" +user + url);
      this.setState({avatar: url});
      // console.log(this.state.avatar);

      return url;

    }).catch((error) => {
      // Handle any errors
      switch (error.code) {
        case 'storage/object-not-found':
          // File doesn't exist
          this.setState({avatar: Images.ProfilePicture}) 
          return Images.ProfilePicture;
          break;
        }
      alert(error);
    });
}
onRefresh = () => {
  this.setState({refreshing: true});

  this.getFollowingPosts().then(() => {
    this.setState({refreshing: false});
  });
}

getNextPosts = ()=>{
  this.setState({getNextPosts: true});
  // alert(this.state.lastDoc)
  // this.getMorePosts();
}



  renderArticles = () => {
    return (
      <Block>
        <FlatList
        showsVerticalScrollIndicator={false}
        onScrollEndDrag={this.getNextPosts}
        refreshControl={
          <RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} />}
        data={this.state.posts}
        renderItem={({ item}) => (
          <Card  item={item} full />
            )}
            keyExtractor={item => item.postId}
        />
      </Block>
//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} />}
//         style = {styles.article}
//         >
//         <Block flex>
//           {
//             this.state.posts.map((post, postIndex)=>(
//               <Card key={postIndex} item={post} full />
//               )
//             )
//           }
          
// {/*           
//           <Card item={this.state} full />
//           <Card item={articles[1]} full />
//           <Card item={articles[2]} full/>
//           <Card item={articles[3]} full />
//           <Card item={articles[4]} full />  */}
//           {/* <Button onPress={()=>{logOut(); this.props.navigation.navigate("SignedOut");}}>
//             Log Out
//           </Button> */}
//           {/* <Card item={articles[0]} horizontal  />
//           <Block flex row>
//             <Card item={articles[1]} style={{ marginRight: theme.SIZES.BASE }} />
//             <Card item={articles[2]} title="Christopher Moon"/>
//           </Block>
//           <Card item={articles[3]} horizontal />
//           <Card item={articles[4]} full /> */}
//         </Block>
//       </ScrollView>
    )
  }

  render() {
    
    return (
      <Block flex center style={styles.home}>
        {this.renderArticles()}
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  home: {
    width: width,    
  },
  articles: {
    width: width,
    paddingVertical: theme.SIZES.BASE,
  },
});

export default Home;
