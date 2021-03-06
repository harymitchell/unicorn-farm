import React, { Component } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Picker } from 'react-native'
import Modal from 'modal-enhanced-react-native-web';

import { gql } from 'apollo-boost';
import { graphql, compose } from 'react-apollo';

import { getUnicornsQuery, updateUnicornMutation } from '../queries/queries';

import UpdateUnicorn from './UpdateUnicorn';

class UnicornList extends Component {
    constructor(props) {
        super(props);
        this.state = { visibleModal: null, selectedUnicorn: null };
    }
    onEditUnicorn(item){
        console.log("item",item);
        console.log("state", this.state);
        this.setState({ visibleModal: true, selectedUnicorn: item, newLocation: null });
    }
    renderFlatListItem(item) {
        return (
            <View style={styles.flatview}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.location}>{item.location ? item.location.name : 'Location Unknown!'}</Text>
                <Text style={styles.edit} onPress={this.onEditUnicorn.bind(this, item)}>edit</Text>
            </View>
    	   );
    }
    _renderButton = (text, onPress) => (
        <TouchableOpacity onPress={onPress}>
          <View style={styles.button}>
            <Text>{text}</Text>
          </View>
        </TouchableOpacity>
     );
    _handleOnScroll = event => {
        this.setState({
          scrollOffset: event.nativeEvent.contentOffset.y
        });
    };
    _handleScrollTo = p => {
        if (this.scrollViewRef) {
          this.scrollViewRef.scrollTo(p);
        }
    };
    _renderModalContent = () => (
        <View style={styles.modalContent}>
            <Text>Change Location:</Text>
            <Picker
              selectedValue={this.state.selectedUnicorn && this.state.selectedUnicorn.location ? this.state.selectedUnicorn.location.id : ''}
              style={{ height: 50, width: 100 }}
              onValueChange={(itemValue, itemIndex) => {
                this.setState({newLocation: itemValue});
              }}>
              <Picker.Item label="Corral" value="1" />
              <Picker.Item label="Pasture" value="2" />
              <Picker.Item label="Barn" value="3" />
            </Picker>
            {this._renderButton("Save", () => {
                console.log("save")
                console.log("state",this.state);
                this.props.updateUnicornMutation({
                    variables: {
                        toLocationId: this.state.newLocation,
                        unicornId: this.state.selectedUnicorn.id
                    },
                    refetchQueries: [{ query: getUnicornsQuery }]
                });
                this.setState({ visibleModal: false });
            })}
        </View>
    );
    showUnicorns(){
        const data = this.props.data;
        console.log(data);
        if(data.loading){
            return (<Text>Loading unicorns...</Text>);
        } else {
            return (
                <View>
                    <Text style={styles.h2text}>Our Unicorns</Text>
                    <FlatList
                      data={data.unicorns}
                      renderItem={({item}) => this.renderFlatListItem(item)}
                    />
                    <Modal
                      isVisible={this.state.visibleModal}
                      onBackdropPress={() => this.setState({ visibleModal: false })}
                    >
                      <UpdateUnicorn selectedUnicorn={this.state.selectedUnicorn}></UpdateUnicorn>
                    </Modal>
                </View>
            );
        }
    }
    render() {
        return (
            <View style={styles.container}>
                {this.showUnicorns()}
            </View>
        )
    }
}

export default graphql(getUnicornsQuery)(UnicornList);
// export default compose(
//     graphql(getUnicornsQuery, { name: "getUnicornsQuery" }),
//     graphql(updateUnicornMutation, { name: "updateUnicornMutation" }),
// )(UnicornList);



const styles = StyleSheet.create({
  container: {
    flex: 1,
    // marginTop: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  h2text: {
    marginTop: 10,
    fontFamily: 'Helvetica',
    fontSize: 36,
    fontWeight: 'bold',
  },
  flatview: {
    justifyContent: 'center',
    paddingTop: 30,
    borderRadius: 2,
  },
  name: {
    fontFamily: 'Verdana',
    fontSize: 18
  },
  location: {
    color: 'grey'
  },
  edit: {
    color: 'blue'
  },
  modalContent: {
    backgroundColor: "white",
    padding: 22,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    borderColor: "rgba(0, 0, 0, 0.1)"
  },
  button: {
    // color: 'white',
    backgroundColor: "blue",
    padding: 12,
    margin: 16,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    borderColor: "rgba(0, 0, 0, 0.1)"
  },
})