  
import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    Platform,
    StatusBar,
    ScrollView,
    Image,
    Dimensions,
    ActivityIndicator,
    RefreshControl
} from "react-native";
import Icon from '../components/Icon';
import Category from '../components/Category';
import PlanCard from "../components/PlanCard";

import * as firebase from 'firebase';

import {key} from '../googleAPIKey';

import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';

import { Images } from '../constants';
import { FlatList } from 'react-native-gesture-handler';

const { height, width } = Dimensions.get('window')
class MyPlans extends Component {

    user = firebase.auth().currentUser;
    
    state = {
        plans:[]        
      };  

    componentWillMount() {
        this.getPlans(()=>{
            console.log(this.state.plans);
        });
    }

    getPlans = (callback)=>{

        let plansRef = firebase.firestore().collection("plans").doc(this.user.uid).collection('userPlans');
    
        let plans = [];
        plansRef.onSnapshot(querySnapshot => {
            querySnapshot.forEach(doc => {
                let plan = doc.data();
                plan.id = doc.id;
              plans.push(plan);
            //   console.log(plans);
            this.setState({plans: plans}, ()=>{callback()});
            });
          });
      }


  
onRefresh = () => {
    this.setState({refreshing: true});
  
    this.getPlaces().then(() => {
      this.setState({refreshing: false});
    });
  }
  
  getMorePlaces =()=>{}

    render() {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>

                    <ScrollView
                        scrollEventThrottle={16}
                    >
                        <View style={{ marginTop: 40 }}>
                            <Text style={{ fontSize: 24, fontWeight: '700', paddingHorizontal: 20 }}>
                                My Plans
                            </Text>
                                {this.state.plans.length==0 && <View style={{paddingTop: 20}}><ActivityIndicator size="large" /></View>}
                            <View style={{ paddingHorizontal: 20, marginTop: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                            <FlatList
                                showsVerticalScrollIndicator={false}
                                onScrollEndDrag={this.getMorePlaces}
                                refreshControl={
                                <RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} />}
                                data={this.state.plans}
                                renderItem={({ item}) => (
          
                                <PlanCard width={width*1.85}
                                    item={item}
                                />
                                    )}
                                    keyExtractor={item => item.id}
                                />
                                
                            </View>
                        </View>
                    </ScrollView>

                </View>
            </SafeAreaView>
        );
    }
}
export default MyPlans;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
});