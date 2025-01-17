import React, { Component } from 'react'
import { FlatList, SectionList, StyleSheet, TouchableOpacity, View } from 'react-native'
import PropTypes from 'prop-types'
import { Text } from 'native-base'
import { Col, Grid } from 'react-native-easy-grid'
import { withTranslation } from 'react-i18next'
import { formatPrice } from '../utils/formatting'
import _ from 'lodash'

import ItemSeparator from './ItemSeparator'

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  adjustmentText: {
    fontSize: 14,
    color: '#999',
  },
  col: {
    justifyContent: 'center',
  },
  colRight: {
    alignItems: 'flex-end',
  },
  itemQuantity: {
    fontWeight: '600',
    fontSize: 15 * 1.2,
  },
  textHighlight: {
    color: '#FF851B',
  },
});

const CartLine = (props) => {

  return (
    <View style={ styles.item }>
      <View style={ styles.col }>
        <Text style={{ fontWeight: 'bold' }}>{ props.label }</Text>
      </View>
      <View style={ [ styles.col, styles.colRight ] }>
        <Text style={{ fontWeight: 'bold' }}>{ props.value }</Text>
      </View>
    </View>
  )
}

const SectionHeader = ({ section: { title } }) => (
  <Text style={{ paddingHorizontal: 15, paddingVertical: 10, fontWeight: '700', color: '#c7c7c7' }}>{title}</Text>
)

const itemsToSections = (itemsGroupedByVendor) =>
  _.map(itemsGroupedByVendor, (items) => ({
    title: items[0].vendor.name,
    data: items,
  }))

class OrderItems extends Component {

  renderItemAdjustments(adjustments, important = false) {

    const textStyle = [ styles.adjustmentText ]
    if (important) {
      textStyle.push(styles.textHighlight)
    }

    return (
      <View>
        { adjustments.map(adjustment => (
          <Text style={ textStyle } key={ `ADJUSTMENT#${adjustment.id}` }>
            { adjustment.label }
          </Text>
        )) }
      </View>
    )
  }

  renderItem(item) {

    const itemQuantityStyle = [ styles.itemQuantity ]
    if (item.quantity > 1) {
      itemQuantityStyle.push(styles.textHighlight)
    }

    return (
      <TouchableOpacity style={ styles.item }>
        <Grid>
          <Col size={ 2 } style={ [ styles.col ] }>
            <Text style={ itemQuantityStyle }>{ `${item.quantity} ×` }</Text>
          </Col>
          <Col size={ 7 } style={ styles.col }>
            <Text>{ item.name }</Text>
            { (item.adjustments && item.adjustments.hasOwnProperty('menu_item_modifier')) &&
              this.renderItemAdjustments(item.adjustments.menu_item_modifier) }
            { (item.adjustments && item.adjustments.hasOwnProperty('reusable_packaging')) &&
              this.renderItemAdjustments(item.adjustments.reusable_packaging, true) }
          </Col>
          <Col size={ 3 } style={ [ styles.col, styles.colRight ] }>
            <Text>{ `${formatPrice(item.total)}` }</Text>
          </Col>
        </Grid>
      </TouchableOpacity>
    )
  }

  _deliveryTotal(order) {
    if (!order.adjustments) {
        return 0
    }

    if (!order.adjustments.hasOwnProperty('delivery')) {
      return 0
    }

    return _.reduce(order.adjustments.delivery, function(total, adj) {
      return total + adj.amount
    }, 0)
  }

  renderAdjustments() {

    return (
      <CartLine
        label={ this.props.t('TOTAL_DELIVERY') }
        value={ `${formatPrice(this._deliveryTotal(this.props.order))}` } />
    )
  }

  renderItemsTotal() {

    return (
      <CartLine
        label={ this.props.t('TOTAL_ITEMS') }
        value={ `${formatPrice(this.props.order.itemsTotal)}` } />
    )
  }

  renderTotal() {

    return (
      <CartLine
        label={ this.props.t('TOTAL') }
        value={ `${formatPrice(this.props.order.total)}` } />
    )
  }

  render() {

    const { order } = this.props

    const itemsGroupedByVendor = _.groupBy(order.items, 'vendor.@id')
    const isMultiVendor = _.size(itemsGroupedByVendor) > 1

    const items = isMultiVendor ?
      itemsToSections(itemsGroupedByVendor) : order.items

    return (
      <View style={ styles.container }>
        <View style={{ flex: 1 }}>
          { isMultiVendor && (
            <SectionList
              sections={ items }
              keyExtractor={ (item, index) => `ITEM#${item.id}` }
              renderItem={ ({ item }) => this.renderItem(item) }
              renderSectionHeader={ SectionHeader } />
          )}
          { !isMultiVendor && (
            <FlatList
              data={ items }
              keyExtractor={ (item, index) => `ITEM#${item.id}` }
              renderItem={ ({ item }) => this.renderItem(item) }
              ItemSeparatorComponent={ ItemSeparator } />
          )}
        </View>
        <View style={{ flex: 0, flexShrink: 1 }}>
          { this.renderItemsTotal() }
          { this.props.withDeliveryTotal === true && this.renderAdjustments() }
          { this.props.withDeliveryTotal === true && this.renderTotal() }
        </View>
      </View>
    )
  }
}

OrderItems.defaultProps = {
  withDeliveryTotal: false,
}

OrderItems.propTypes = {
  withDeliveryTotal: PropTypes.bool,
}

export default withTranslation()(OrderItems)
