// @see https://reactnavigation.org/docs/navigating-without-navigation-prop

import * as React from 'react'
import { NavigationActions } from '@react-navigation/compat'

export default class NavigationHolder {

  static navigationRef

  static setNavigationRef(navigationRef) {
    this.navigationRef = navigationRef
  }

  static navigate(routeName, params) {
    return this.navigationRef.current?.navigate(routeName, params)
  }

  static dispatch(action) {
    return this.navigationRef.current?.dispatch(action)
  }

  static goBack() {
    return this.navigationRef.current?.dispatch(
      NavigationActions.back({
        key: null,
      })
    )
  }
}
