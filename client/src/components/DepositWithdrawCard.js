import React from "react";
import "./DepositWithdrawCard.css";

const buttonStyle = {
  width: "100%",
};

const DepositWithdrawCard = props => {
  return (
    <p>Deposit withdraw card</p>
  )
  
  // if (!props.show) {
  //   return null;
  // }

  // return (
  //   <div className="card">
  //       <div className="card-header">
  //         <h2 className="card-title">{props.symbol.toUpperCase()}</h2>
  //       </div>
  //       <div className="card-body">
  //         <form onSubmit={(e) => props.deposit(e, props.symbol)}>
  //           <div className="row">
  //             <div className="col-md-3">
  //               <label>Amount</label>
  //             </div>
  //             <div className="col-md-8">
  //               <input
  //                 style={{ width: "300px" }}
  //                 onChange={(e) => props.setAmount(e.target.value)}
  //               />
  //             </div>
  //           </div>
  //           <div className="row">
  //             <div className="col-md-3"></div>
  //             <div className="col-md-4">
  //               <button
  //                 style={{ width: "100%" }}
  //                 onClick={(e) => props.setIsDeposit(true)}
  //                 className="btn btn-primary"
  //               >
  //                 Deposit
  //               </button>
  //             </div>
  //           </div>
  //         </form>
  //       </div>
  //       <div className="modal-footer">
  //         <button
  //           style={{ marginRight: "42px" }}
  //           onClick={props.onClose}
  //           className="btn btn-primary"
  //         >
  //           Close
  //         </button>
  //       </div>
  //     </div>
  // );
};

export default DepositWithdrawCard;
