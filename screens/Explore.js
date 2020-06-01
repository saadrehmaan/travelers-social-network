  
import React, { Component } from "react";
import {
    View,
    
    StyleSheet,
    SafeAreaView,
    TextInput,
    Platform,
    StatusBar,
    ScrollView,
    Image,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity
} from "react-native";
import Icon from '../components/Icon';
import Category from '../components/Category';
import PlaceCard from "../components/PlaceCard";
import { Block, theme, Text } from 'galio-framework';

import * as firebase from 'firebase';

import {key} from '../googleAPIKey';

import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';

import { Images } from '../constants';
import { FlatList } from 'react-native-gesture-handler';

const { height, width } = Dimensions.get('window');
class Explore extends Component {
    user = firebase.auth().currentUser;
    firestoreUsersRef = firebase.firestore().collection("users");
    firestorePostRef = firebase.firestore().collection("posts");
    firestoreFollowingRef = firebase.firestore().collection("following").doc(this.user.uid)
    .collection("userFollowing");

    state = {
        places: [],
        refreshing: false,
        currentLocation: {},
        placeType: 'tourist_attraction',
        currentUserInterests:[],
        suggestedUsers: []
        
      };  

    componentWillMount() {
        this.startHeaderHeight = 80
        if (Platform.OS == 'android') {
            this.startHeaderHeight = 100 + StatusBar.currentHeight
        }

        this.findNewCoordinates(33.63441952400522, 72.98635723489069)


        this.getCurrentLocation().then(()=>{
            this.getPlaces();
        })
        this.getSuggestedFriends();
    }

    
    findNewCoordinates = (lat, lng) =>{

        let r_earth = 6371;
    
        // East 50km
        let lat1  = lat  + (50 / r_earth) * (180 / Math.PI);
        let lng1 = lng + (0 / r_earth) * (180 / Math.PI) / Math.cos(lat * Math.PI/180);
        let p1 = {lat1, lng1};
        
        // West 50km
        let lat2  = lat  + (0 / r_earth) * (180 / Math.PI);
        let lng2 = lng + (50 / r_earth) * (180 / Math.PI) / Math.cos(lat * Math.PI/180);
        let p2 = {lat2, lng2};
        
        // North 50km
        let lat3 = lat  + (-50 / r_earth) * (180 / Math.PI);
        let lng3 = lng + (0 / r_earth) * (180 / Math.PI) / Math.cos(lat * Math.PI/180);
        let p3 = {lat3, lng3};
    
        // South 50km
        let lat4 = lat  + (0 / r_earth) * (180 / Math.PI);
        let lng4 = lng + (-50 / r_earth) * (180 / Math.PI) / Math.cos(lat * Math.PI/180);
        let p4 = {lat4, lng4};


        console.log(p1, p2, p3, p4);
    }



getCurrentLocation = async()=>{
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }
  
    let location = await Location.getCurrentPositionAsync({});
    let currentLocation = {
            lat: location.coords.latitude,
            long: location.coords.longitude
    }
    
    this.setState({ currentLocation: currentLocation});
    // console.log(this.state.currentLocation);
    
}

getPlacesUrl = (lat, long, radius, type)=> {
    const baseUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?`;
    const location = `location=${lat},${long}&radius=${radius}`;
    const typeData = `&keyword=${type}`;
    
    const api = `&key=${key}`;
    console.log(`${baseUrl}${location}${typeData}${api}`);
    return `${baseUrl}${location}${typeData}${api}`;

  }



  getPlaces = ()=> {
    const {currentLocation, placeType } = this.state;
    const lat = currentLocation.lat;
    const long = currentLocation.long;
    const markers = [];
    const url = this.getPlacesUrl(lat, long, 50000, placeType);
    console.log(url);
    fetch(url)
      .then(res => res.json())
      .then(res => {
        //   console.log(res.results);
        res.results.map((element, index) => {
          const marketObj = {};
          marketObj.id = element.id;
          marketObj.place_id = element.place_id;
          marketObj.name = element.name;
          marketObj.photos = element.photos;
          marketObj.rating = element.rating;
          marketObj.vicinity = element.vicinity;
          marketObj.type = element.type;
          marketObj.marker = {
            latitude: element.geometry.location.lat,
            longitude: element.geometry.location.lng
          };

          markers.push(marketObj);
        });
        //update our places array
        this.setState({ places: markers, refreshing:false });
        // console.log(this.state.places);
      });
  }

  
onRefresh = () => {
    this.setState({refreshing: true});
  
    this.getPlaces();
  }
  
  getMorePlaces =()=>{}


  getUserInterests = (callback)=>{
      let currentUserInterests = [];
      this.firestoreUsersRef.doc(this.user.uid).get().then((doc)=>{
        doc.data().interests.forEach(interest => {
            if(interest.selected){
            currentUserInterests.push(interest.name);
        }
        });
        this.setState({currentUserInterests: currentUserInterests}, ()=>{callback()});
        // console.log(this.state.currentUserInterests);

      })
  }

  getProfilePic = (userId,callback) =>{
      let profilePic ="";
    const firebaseProfilePic = firebase.storage().ref().child("profilePics/("+userId+")ProfilePic");
    firebaseProfilePic.getDownloadURL().then((url)=> {
    
    //   this.setState({profilePic: url});
    profilePic =url;
    callback(profilePic);

    }).catch((error) => {
      // Handle any errors
      switch (error.code) {
        case 'storage/object-not-found':
          // File doesn't exist
        //   this.setState({profilePic: Images.ProfilePicture}) 
        profilePic = Images.ProfilePicture;
        callback(profilePic);
          break;
        }
      alert(error);
    });
    return profilePic;
}

  getProfileInfo = (userId, callback)=>{
    let profilePic = this.getProfilePic(userId, (profilePic)=>{

        let username = "";
        let profileObj = {};
        this.firestoreUsersRef.doc(userId).get().then((doc)=>{
            username = doc.data().username;
            profileObj = {
                userId: userId,
                username: username,
                profilePic: profilePic
            }
            // console.log(profileObj);
            callback(profileObj);
        })
        
        // return profileObj;
    });

  }

  getSuggestedFriends = ()=>{
    this.getUserInterests(()=>{
        // console.log(this.state.currentUserInterests)
        let suggestedUsers = [];
        this.firestoreUsersRef.where('interestsArr', 'array-contains-any', this.state.currentUserInterests).get().then((docs)=>{
            docs.forEach(doc => {
                let profileInfo = this.getProfileInfo(doc.id, (profileObj)=>{

                    suggestedUsers.push(profileObj);
                    // console.log(suggestedUsers);
                    this.setState({suggestedUsers: suggestedUsers}, console.log(this.state.suggestedUsers));
                    
                });
                
            });
        })
    })
  }




    render() {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                    {/* <View style={{ height: this.startHeaderHeight, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#dddddd' }}>
                        <View style={{
                            flexDirection: 'row', padding: 10,
                            backgroundColor: 'white', marginHorizontal: 20,
                            shadowOffset: { width: 0, height: 0 },
                            shadowColor: 'black',
                            shadowOpacity: 0.2,
                            elevation: 1,
                            marginTop: Platform.OS == 'android' ? 30 : null
                        }}>
                            <Icon name="ios-search" size={20} style={{ marginRight: 10 }} />
                            <TextInput
                                underlineColorAndroid="transparent"
                                placeholder="Try New Delhi"
                                placeholderTextColor="grey"
                                style={{ flex: 1, fontWeight: '700', backgroundColor: 'white' }}
                            />
                        </View>
                    </View> */}
        <Block style={{marginTop:10}}>
        <Text h4 style={{marginBottom:5, paddingLeft:20}}>Suggested Users</Text>
        {/* <TouchableOpacity
                                    onPress={()=>{
                                        // console.log(place.place_id);
                                        this.props.navigation.navigate("SpotDetail", {
                                            spot_id: place.place_id, 
                                            added: true,
                                            destination_id: this.state.destination_id, 
                                            addSpot: this.addSpot.bind(this),
                                            removeSpot: this.removeSpot.bind(this),
                                            startDate: this.state.startDate,
                                            endDate: this.state.endDate

                                        })}
                                    }>
                                    <Category 
                                        imageUri="https://lh3.googleusercontent.com/proxy/Bj1DtAsY0dnyEBvHLs9uLDjC1MxUjBK0K5MI72KLz31jhAHegsBsbYW1BDk0yn8diISkKytYK4EMVLvHKpu74AuDHxcnBPDLln35E8YTqIzK"
                                        name="Saad"
                                        // friend={false}
                                    />
                                    </TouchableOpacity> */}


                                    <ScrollView
                                    horizontal={true}
                                    showsHorizontalScrollIndicator={false}
                                >
                                    {this.state.suggestedUsers!=null&&
                                    this.state.suggestedUsers.map((user, i)=>{
                                        // console.log("GOT ITdjdbjkasbjsabj..",place);
                                    return(
                                    <TouchableOpacity key={i}
                                    onPress={()=>{
                                        // console.log(place.place_id);'userProfile',{userId: this.state.foundUser}
                                        this.props.navigation.navigate("userProfile", {
                                            userId: user.userId

                                        })}
                                    }>
                                    <Category 
                                        imageUri={user.profilePic}
                                        name={user.username}
                                        // friend={false}
                                    />
                                    </TouchableOpacity>
                                    )
                                    })
                                }
                                </ScrollView>
                    </Block>

                    {/* <ScrollView
                        scrollEventThrottle={16}
                    > */}
                        {/* <View style={{ flex: 1, backgroundColor: 'white', paddingTop: 20 }}>
                            <Text style={{ fontSize: 24, fontWeight: '700', paddingHorizontal: 20 }}>
                                What can we help you find, Varun?
                            </Text>

                            <View style={{ height: 130, marginTop: 20 }}>
                                <ScrollView
                                    horizontal={true}
                                    showsHorizontalScrollIndicator={false}
                                >
                                    <Category imageUri="https://media-exp1.licdn.com/dms/image/C560BAQHMnA03XDdf3w/company-logo_200_200/0?e=2159024400&v=beta&t=C7KMOtnrJwGrMXmgIk2u1B8a7VRfgxMwXng9cdP9kZk"
                                        name="Home"
                                    />
                                    <Category imageUri="https://media-exp1.licdn.com/dms/image/C560BAQHMnA03XDdf3w/company-logo_200_200/0?e=2159024400&v=beta&t=C7KMOtnrJwGrMXmgIk2u1B8a7VRfgxMwXng9cdP9kZk"
                                        name="Experiences"
                                    />
                                    <Category imageUri="https://media-exp1.licdn.com/dms/image/C560BAQHMnA03XDdf3w/company-logo_200_200/0?e=2159024400&v=beta&t=C7KMOtnrJwGrMXmgIk2u1B8a7VRfgxMwXng9cdP9kZk"
                                        name="Resturant"
                                    />
                                </ScrollView>
                            </View>
                            <View style={{ marginTop: 40, paddingHorizontal: 20 }}>
                                <Text style={{ fontSize: 24, fontWeight: '700' }}>
                                    Introducing Airbnb Plus
                                </Text>
                                <Text style={{ fontWeight: '100', marginTop: 10 }}>
                                    A new selection of homes verified for quality & comfort

                                </Text>
                                <View style={{ width: width - 40, height: 200, marginTop: 20 }}>
                                    <Image
                                        style={{ flex: 1, height: null, width: null, resizeMode: 'cover', borderRadius: 5, borderWidth: 1, borderColor: '#dddddd' }}
                                        source={{uri:"https://media-exp1.licdn.com/dms/image/C560BAQHMnA03XDdf3w/company-logo_200_200/0?e=2159024400&v=beta&t=C7KMOtnrJwGrMXmgIk2u1B8a7VRfgxMwXng9cdP9kZk" }}
                                    />

                                </View>
                            </View>
                        </View> */}
                        <View style={{ marginTop: 5 }}>
                            <Text h4 style={{ paddingHorizontal: 20 }}>
                                Places around You
                            </Text>
                                {this.state.places.length==0 && <ActivityIndicator size="large" />}
                            <View style={{ paddingHorizontal: 20, marginTop: 5, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                            <FlatList
                                showsVerticalScrollIndicator={false}
                                onScrollEndDrag={this.getMorePlaces}
                                refreshControl={
                                <RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} />}
                                data={this.state.places}
                                renderItem={({ item}) => (
          
                                <PlaceCard width={width*1.85}
                                    item={item}
                                />
                                    )}
                                    keyExtractor={item => item.id}
                                />
                                <View style={{marginTop: 5}}>

                                </View>

                                {/* <PlaceCard width={width}
                                    name="The Cozy Place"
                                    type="PRIVATE ROOM - 2 BEDS"
                                    price={82}
                                    rating={4}
                                />
                                <PlaceCard width={width}
                                    name="The Cozy Place"
                                    type="PRIVATE ROOM - 2 BEDS"
                                    price={82}
                                    rating={4}
                                />
                                <PlaceCard width={width}
                                    name="The Cozy Place"
                                    type="PRIVATE ROOM - 2 BEDS"
                                    price={82}
                                    rating={4.5}
                                /> */}
                            </View>
                        </View>
                    {/* </ScrollView> */}

                </View>
            </SafeAreaView>
        );
    }
}
export default Explore;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
});