import React from 'react';
import MapView, { Marker, Callout  } from 'react-native-maps';
import Heatmap from 'react-native-maps';

import { StyleSheet, Text, View, Dimensions } from 'react-native';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import * as firebase from 'firebase';
import {GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import {key} from '../googleAPIKey';


// https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-33.8670522,151.1957362&radius=1500&type=restaurant&keyword=cruise&key=AIzaSyC3jftuRYj7vJ5cB-HGvzq6fC60WXOCtoM

export default class Maps extends React.Component {


  userId = firebase.auth().currentUser.uid;
  currentUserRef = firebase.firestore().collection("users").doc(this.userId);
  firestoreFollowingRef = firebase.firestore().collection("following").doc(this.userId).collection("userFollowing");
  firestoreUserRef = firebase.firestore().collection("users");

state = {
  latitude: null,
  longitude: null,
  places: null,
  heatPoints: null,
  location: null,
  region: null,
  errorMessage: null,
  lastSeen: null,
  currentUsername: "",
  followedUsers:[],
  followingUserMarkers:[]

}



componentWillMount = () =>{
  this.getLocationAsync();
  this.getCurrentUsername();
  this.getLocationsOfFollowedUsers();
  // this.updateFirebaseLocation();
  }

  
// updateFirebaseLocation = ()=>{
// this.getLocationAsync();
// let latitude = this.state.region.latitude;
// let longitude = this.state.region.longitude;

// }



getLocationAsync = async () => {
  let { status } = await Permissions.askAsync(Permissions.LOCATION);
  if (status !== 'granted') {
    this.setState({
      errorMessage: 'Permission to access location was denied',
    });
  }

  let location = await Location.getCurrentPositionAsync({});
  let time = this.getTimeFromDate(location.timestamp);
  let region = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421
  }
  
  this.setState({ region: region, lastSeen: time });
  console.log(this.state.region, " Time: "+ time);

  
this.currentUserRef.set({
  location: {latitude: location.coords.latitude, longitude: location.coords.longitude, lastSeen: time}
}, { merge: true }).then(()=>{console.log("updated location!")})
  
};




getLocationsOfFollowedUsers = () =>{
  this.getFollowedUsers().then(()=>{

  
  
  const followedUsers = this.state.followedUsers;
  const userMarkers = [];
  followedUsers.forEach((user, index)=>{
    this.firestoreUserRef.doc(user).get().then((doc)=>{
      let docData = doc.data();
      
      if(docData.location){
        console.log(docData.location);

      let latitude = docData.location.latitude;
      let longitude = docData.location.longitude;
      let userName = docData.username;
      let lastSeen = docData.location.lastSeen

      userMarkers.push(
        <Marker 
        key = {index}
        coordinate = {{
          latitude: latitude,
          longitude: longitude
        }}
        >
          <Callout>
            <View>
            <Text>{userName}</Text>
            <Text>Last Seen: {lastSeen}</Text>
            {/* <Text>Open: {marker.opening_hours.open_now ? "YES" : "NO"}</Text> */}
            </View>
          </Callout>
        </Marker>
      );
      
  console.log(userMarkers);  
  this.setState({followingUserMarkers: userMarkers});
    }

    
    });
    
  });

});
}




// Get all the users the current user is following
getFollowedUsers = async() => {
  let users = [];
  await this.firestoreFollowingRef.get().then((querySnapshot)=>{
    querySnapshot.forEach(docSnap =>{
      users.push(docSnap.id);
      
    });
  // this.setState({followedUsers: users});
  });
  this.setState({followedUsers: users});
  console.log(this.state.followedUsers);

}


///GETTING TIME FROM TIMESTAMP

pad = (num)=> { 
  return ("0"+num).slice(-2);
}
getTimeFromDate = (timestamp) => {
  var date = new Date(timestamp * 1000);
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  // return this.pad(hours)+":"+this.pad(minutes)+":"+this.pad(seconds)
  return this.pad(hours)+":"+this.pad(minutes);
}
 

//--------------------------------------------------//




getCurrentUsername=()=>{
  firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).get().then((document)=>{
    this.setState({currentUsername: document.data().username})
    console.log(this.state.currentUsername);
});
}


handleChangeLocation = (location)=>{
  let region = {
    latitude: location.nativeEvent.coordinate.latitude,
    longitude: location.nativeEvent.coordinate.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421
  }
  this.setState({region: region});
}


onRegionChange= (region)=>{
  this.setState({region});
}

  render() {
    return (
      
      <View style={styles.container}>
      {
      !this.state.errorMessage&& this.state.region?
       <MapView showsUserLocation
        provider={"google"}
        style={styles.mapStyle}
        region={this.state.region}
        // onRegionChange={this.onRegionChange}
        // onUserLocationChange={this.handleChangeLocation}
        >
      {this.state.followingUserMarkers}
    </MapView>   
    :null
    }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapStyle: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});
