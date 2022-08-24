import "./App.css";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import DepositModal from "./components/modals/DepositModal";
import WithdrawModal from "./components/modals/WithdrawModal";

import bankAccountArtifact from "./abis/BankAccount.json";
import maticArtifact from "./abis/Matic.json";
import usdtArtifact from "./abis/Usdt.json";

function App() {
  const [provider, setProvider] = useState(undefined);
  const [signer, setSigner] = useState(undefined);
  const [signerAddress, setSignerAddress] = useState(undefined);
  const [bankAccountContract, setBankAccountContract] = useState(undefined);
  const [tokenContracts, setTokenContracts] = useState({});
  const [tokenBalances, setTokenBalances] = useState({});
  const [tokenSymbols, setTokenSymbols] = useState([]);

  const [amount, setAmount] = useState(0);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(undefined);
  const [isDeposit, setIsDeposit] = useState(true);
  const [isWithdraw, setIsWithdraw] = useState(true);

  const toBytes32 = (text) => ethers.utils.formatBytes32String(text);
  const toString = (bytes32) => ethers.utils.parseBytes32String(bytes32);
  const toWei = (ether) => ethers.utils.parseEther(ether);
  const toEther = (wei) => ethers.utils.formatEther(wei).toString();
  const toRound = (num) => Number(num).toFixed(2);

  useEffect(() => {
    const init = async () => {
      const provider = await new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);

      const bankAccountContract = await new ethers.Contract(
        '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
        bankAccountArtifact.abi
      );
      setBankAccountContract(bankAccountContract);

      bankAccountContract
        .connect(provider)
        .getWhitelistedSymbols()
        .then((result) => {
          const symbols = result.map((s) => toString(s));
          setTokenSymbols(symbols);
          getTokenContracts(symbols, bankAccountContract, provider);
        });
    };
    init();
  }, []);

  const getTokenContract = async (symbol, bankAccountContract, provider) => {
    const address = await bankAccountContract
      .connect(provider)
      .getWhitelistedTokenAddress(toBytes32(symbol));
    const abi =
      symbol === "Matic"
        ? maticArtifact.abi
        : usdtArtifact.abi;
    const tokenContract = new ethers.Contract(address, abi);
    return tokenContract;
  };

  const getTokenContracts = async (symbols, bankAccountContract, provider) => {
    symbols.map(async (symbol) => {
      const contract = await getTokenContract(symbol, bankAccountContract, provider);
      setTokenContracts((prev) => ({ ...prev, [symbol]: contract }));
    });
  };

  const isConnected = () => signer !== undefined;

  const getSigner = async (provider) => {
    provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    signer.getAddress().then((address) => {
      setSignerAddress(address);
    });

    return signer;
  };

  const connect = () => {
    getSigner(provider).then((signer) => {
      setSigner(signer);
      getTokenBalances(signer);
    });
  };

  const getTokenBalance = async (symbol, signer) => {
    const balance = await bankAccountContract
      .connect(signer)
      .getTokenBalance(toBytes32(symbol));
    return toEther(balance);
  };

  const getTokenBalances = (signer) => {
    tokenSymbols.map(async (symbol) => {
      const balance = await getTokenBalance(symbol, signer);
      setTokenBalances((prev) => ({ ...prev, [symbol]: balance.toString() }));
    });
  };

  const displayDepositModal = (symbol) => {
    setSelectedSymbol(symbol);
    setShowDepositModal(true);
  };

  const displayWithdrawModal = (symbol) => {
    setSelectedSymbol(symbol);
    setShowWithdrawModal(true);
  };

  const depositTokens = (wei, symbol) => {
    if (symbol === "Eth") {
      signer.sendTransaction({
        to: bankAccountContract.address,
        value: wei,
      });
    } else {
      const tokenContract = tokenContracts[symbol];
      tokenContract
        .connect(signer)
        .approve(bankAccountContract.address, wei)
        .then(() => {
          bankAccountContract.connect(signer).depositTokens(wei, toBytes32(symbol));
        });
    }
  };

  const withdrawTokens = (wei, symbol) => {
    if (symbol === "Eth") {
      bankAccountContract.connect(signer).withdrawEther(wei);
    } else {
      bankAccountContract.connect(signer).withdrawTokens(wei, toBytes32(symbol));
    }
  };

  const deposit = (e, symbol) => {
    e.preventDefault();
    const wei = toWei(amount);
    depositTokens(wei, symbol);
  };

  const withdraw = (e, symbol) => {
    e.preventDefault();
    const wei = toWei(amount);
    withdrawTokens(wei, symbol);
  };

  return (
    <div className="App">
      <header className="App-header">
        {isConnected() ? (
          <div>
            <p>Welcome {signerAddress?.substring(0, 10)}...</p>
            <div>
              <div className="list-group">
                <div className="list-group-item">
                  {Object.keys(tokenBalances).map((symbol, idx) => (
                    <div className=" row d-flex py-3" key={idx}>
                      <div className="col-md-3">
                        <div>{symbol.toUpperCase()}</div>
                      </div>

                      <div className="d-flex gap-4 col-md-3">
                        <small className="opacity-50 text-nowrap">
                          {toRound(tokenBalances[symbol])}
                        </small>
                      </div>
                      {deposit &&
                      <div className="d-flex gap-4 col-md-6">
                        <button
                          onClick={() => displayDepositModal(symbol)}
                          className="btn btn-primary"
                        >
                          Deposit
                        </button>
                        <DepositModal
                          show={showDepositModal}
                          onClose={() => setShowDepositModal(false)}
                          symbol={selectedSymbol}
                          deposit={deposit}
                          isDeposit={isDeposit}
                          setIsDeposit={setIsDeposit}
                          setAmount={setAmount}
                        />
                      </div>}
                      {withdraw &&
                      <div className="d-flex gap-4 col-md-6">
                        <button
                          onClick={() => displayWithdrawModal(symbol)}
                          className="btn btn-primary"
                        >
                          Withdraw
                        </button>
                        <WithdrawModal
                          show={showWithdrawModal}
                          onClose={() => setShowWithdrawModal(false)}
                          symbol={selectedSymbol}
                          withdraw={withdraw}
                          isWithdraw={isWithdraw}
                          setIsWithdraw={setIsWithdraw}
                          setAmount={setAmount}
                        />
                      </div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p>You are not connected</p>
            <button onClick={connect} className="btn btn-primary">
              Connect Metamask
            </button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
