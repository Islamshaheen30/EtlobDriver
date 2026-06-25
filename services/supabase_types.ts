
export type Json =
  
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string
          customer_id: string
          restaurant_id: string
          driver_id: string | null
          status: string
          total_amount: number
          created_at: string
        }
      }
    }
  }
}
