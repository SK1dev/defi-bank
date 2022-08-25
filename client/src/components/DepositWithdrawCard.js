import "./DepositWithdrawCard.css";

const DepositWithdrawCard = props => {
  const backToHome = () => {
    props.setShowCard(false);
  };

  return (
    <div className="deposit-withdrawal">
      <div className="deposit-withdraw-card">
        <div className="card-header">
          <h2 className="card-title">{props.symbol.toUpperCase()}</h2>
        </div>
        <div className="card-body">
          <form onSubmit={(e) => props.depositOrWithdraw(e, props.symbol)}>
            {props.isDepositCard && (
              <>
                <div className="deposit-card">
                  <input
                    style={{ width: "300px" }}
                    placeholder="Amount"
                    onChange={(e) => props.setAmount(e.target.value)}
                  />
                  <button
                    style={{ width: "100%" }}
                    onClick={(e) => props.setIsDeposit(true)}
                    className="btn btn-primary"
                  >
                    Deposit
                  </button>
                </div>
              </>
            )}
            {props.isWithdrawCard && (
              <>
                <div className="withdraw-card">
                  <div>
                    <input
                      style={{ width: "300px" }}
                      placeholder="Amount"
                      onChange={(e) => props.setAmount(e.target.value)}
                    />
                  </div>
                  <button
                    style={{ width: "100%" }}
                    onClick={(e) => props.setIsDeposit(false)}
                    className="btn btn-primary"
                  >
                    Withdraw
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
        <div className="back-btn-container">
          <button onClick={backToHome} className="btn btn-primary">
            Return to accounts page
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepositWithdrawCard;
