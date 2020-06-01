import React, { Component } from "react";
import {
    View,
    StyleSheet,
    Image, 
    TouchableOpacity,
    Dimensions
} from "react-native";
import StarRating from 'react-native-star-rating'
import { key } from '../googleAPIKey';
import {Images} from "../constants";
import { withNavigation } from 'react-navigation';
// import { Button, Block, theme } from "galio-framework";
import { Button, Block, Text, theme, } from "galio-framework";


const { height, width } = Dimensions.get('window');


class PlanCard extends Component {
    render() {
        const {item, navigation} = this.props;
        console.log(item);
        return (
            <Block shadow  style={{borderRadius:5}}>
            <TouchableOpacity onPress={()=>{
                // console.log(post.image);
                navigation.navigate("EditPlan",{plan: item})
            }
                }>
            <View style={{ width: this.props.width / 2 - 30, height: this.props.width / 2 - 20, margin: 10 }}>
                <View style={{ flex: 3 }} >
                    <Image
                        style={{ flex: 1, width: null, height: null, resizeMode: 'cover', borderRadius: 10}}
                        source={item.photos && {
                            uri:
                              item.photos.length > 0
                                ? item.photos[0]
                                : "http://www.clker.com/cliparts/P/b/P/L/T/i/map-location-md.png"
                                }} />
                </View>
                <View style={{backgroundColor: '#f0f0f0',borderBottomEndRadius:10, borderBottomStartRadius:10, flex: 1, alignItems: 'flex-start', justifyContent: 'space-evenly', paddingLeft: 10 }}>
                    {/* <Text style={{ fontSize: 10, color: '#b63838' }}>{item.vicinity}</Text> */}
                    <Text h4 style={{marginTop:7}}>{item.destination}</Text>
                    <Block center shadow flex = {1} row style={{padding:5, borderRadius: 15, marginBottom: 5 , marginTop:5, width:width*0.8}}>
                    <Block left flex={1}>
                        <Text h7>From</Text>
                        <Text h7>{item.startDate}</Text>
                    </Block>
                    <Block center flex={1}>
                        <Text h7>     </Text>
                        <Text h7> --- </Text>
                    </Block>
                    <Block right flex={1}>
                        <Text h7>To</Text>
                        <Text h7>{item.endDate}</Text>
                    </Block>
                </Block>
                    {/* <Text style={{ fontSize: 10 }}>{this.props.price}$</Text> */}
                    {/* <StarRating
                        disable={true}
                        maxStars={5}
                        rating={item.rating}
                        starSize={10}

                    /> */}
                </View>
            </View>
            </TouchableOpacity>
            </Block>
        );
    }
}
export default withNavigation(PlanCard);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
});