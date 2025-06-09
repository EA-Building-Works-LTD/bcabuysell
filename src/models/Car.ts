import mongoose, { Schema, Document } from 'mongoose';

// Define a Repair interface
export interface IRepair {
  type: string;
  cost: number;
  description?: string;
}

// Define Car interface
export interface ICar extends Document {
  makeModel: string;
  auctionSource: string;
  regNumber?: string;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  color?: string;
  mot?: string;
  purchasePrice: number;
  recoveryPrice: number;
  fuelCost: number;
  insuranceCost: number;
  repairs: IRepair[];
  salePrice: number;
  soldPrice?: number;
  profit?: number;
  notes?: string;
  purchaseDate: Date;
  soldDate?: Date;
  status: 'purchased' | 'listed' | 'sold';
  imageUrl?: string;
  userId?: mongoose.Schema.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

// Create Repair Schema
const RepairSchema = new Schema<IRepair>({
  type: { type: String, required: true },
  cost: { type: Number, required: true },
  description: { type: String }
});

// Create Car Schema
const CarSchema = new Schema<ICar>(
  {
    makeModel: { type: String, required: true },
    auctionSource: { type: String, required: true },
    regNumber: { type: String },
    mileage: { type: Number },
    fuelType: { type: String },
    transmission: { type: String },
    color: { type: String },
    mot: { type: String },
    purchasePrice: { type: Number, required: true },
    recoveryPrice: { type: Number, required: true },
    fuelCost: { type: Number, required: true },
    insuranceCost: { type: Number, required: true },
    repairs: [RepairSchema],
    salePrice: { type: Number, required: true },
    soldPrice: { type: Number },
    profit: { type: Number },
    notes: { type: String },
    purchaseDate: { type: Date, required: true },
    soldDate: { type: Date },
    imageUrl: { type: String },
    status: { 
      type: String, 
      enum: ['purchased', 'listed', 'sold'], 
      default: 'purchased' 
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      default: 'default-user' // Default user ID instead of requiring it
    }
  },
  { timestamps: true }
);

// Pre-save middleware to calculate profit and capitalize registration
CarSchema.pre('save', function(next) {
  // Calculate profit if car is sold
  if (this.soldPrice) {
    const totalCosts = 
      this.purchasePrice + 
      this.recoveryPrice + 
      this.fuelCost + 
      this.insuranceCost + 
      this.repairs.reduce((sum, repair) => sum + repair.cost, 0);
    
    this.profit = this.soldPrice - totalCosts;
  }
  
  // Capitalize registration number
  if (this.regNumber) {
    this.regNumber = this.regNumber.toUpperCase();
  }
  
  next();
});

// Create and export the model
export default mongoose.models.Car || mongoose.model<ICar>('Car', CarSchema); 