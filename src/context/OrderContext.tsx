import React, {
  createContext,
  useCallback,
  useContext,
} from "react";

import {
  useAppDispatch,
  useAppSelector,
} from "../redux/store/hooks";

import {
  fetchDriverOrders,
  updateOrderStatus,
} from "../redux/features/order/orderThunk";

import {
  OrderStatus,
} from "../types/order.types";


interface OrderContextValue {

  refreshOrders: () => Promise<void>;

  changeStatus: (
    orderId: string,
    status: OrderStatus
  ) => Promise<void>;

}


const OrderContext =
  createContext<
    OrderContextValue | undefined
  >(undefined);


export function OrderProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const dispatch =
    useAppDispatch();

  const driver =
    useAppSelector(
      (state) =>
        state.driver.driver 
    );


  const refreshOrders =
    useCallback(
      async () => {

        if (!driver?._id) {
          return;
        }

        await dispatch(
          fetchDriverOrders(
            driver._id
          )
        ).unwrap();

      },
      [
        dispatch,
        driver?._id,
      ]
    );


  const changeStatus =
    useCallback(
      async (
        orderId: string,
        status: OrderStatus
      ) => {

        await dispatch(
          updateOrderStatus({
            orderId,
            status,
          })
        ).unwrap();

      },
      [dispatch]
    );


  return (
    <OrderContext.Provider
      value={{
        refreshOrders,
        changeStatus,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}


export function useOrder() {

  const context =
    useContext(OrderContext);

  if (!context) {

    throw new Error(
      "useOrder must be used inside OrderProvider"
    );
  }

  return context;
}