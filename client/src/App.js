import "./App.css";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import DepositWithdrawCard from "./components/DepositWithdrawCard";
import logo from "./bankX.png";
import bankAccountArtifact from "./abis/BankAccount.json";
import maticArtifact from "./abis/Matic.json";
import usdtArtifact from "./abis/Usdt.json";

import { bankAccountContractAddress } from "./config";

function App() {
  const [provider, setProvider] = useState(undefined);
  const [signer, setSigner] = useState(undefined);
  const [signerAddress, setSignerAddress] = useState(undefined);
  const [bankAccountContract, setBankAccountContract] = useState(undefined);
  const [tokenContracts, setTokenContracts] = useState({});
  const [tokenBalances, setTokenBalances] = useState({});
  const [tokenSymbols, setTokenSymbols] = useState([]);

  const [amount, setAmount] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(undefined);
  const [isDeposit, setIsDeposit] = useState(true);
  const [isWithdraw, setIsWithdraw] = useState(true);
  const [isWithdrawCard, setIsWithdrawCard] = useState(false);
  const [isDepositCard, setIsDepositCard] = useState(false);

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
        bankAccountContractAddress,
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
    const abi = symbol === "Matic" ? maticArtifact.abi : usdtArtifact.abi;
    const tokenContract = new ethers.Contract(address, abi);
    return tokenContract;
  };

  const getTokenContracts = async (symbols, bankAccountContract, provider) => {
    symbols.map(async (symbol) => {
      const contract = await getTokenContract(
        symbol,
        bankAccountContract,
        provider
      );
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

  const displayDepositCard = (symbol) => {
    setSelectedSymbol(symbol);
    setShowCard(true);
    setIsDepositCard(true);
    setIsWithdrawCard(false);
  };

  const displayWithdrawCard = (symbol) => {
    setSelectedSymbol(symbol);
    setShowCard(true);
    setIsDepositCard(false);
    setIsWithdrawCard(true);
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
          bankAccountContract
            .connect(signer)
            .depositTokens(wei, toBytes32(symbol));
        });
    }
  };

  const withdrawTokens = (wei, symbol) => {
    if (symbol === "Eth") {
      bankAccountContract.connect(signer).withdrawEther(wei);
    } else {
      bankAccountContract
        .connect(signer)
        .withdrawTokens(wei, toBytes32(symbol));
    }
  };

  const depositOrWithdraw = (e, symbol) => {
    e.preventDefault();
    const wei = toWei(amount);

    if (isDeposit) {
      depositTokens(wei, symbol);
    } else {
      withdrawTokens(wei, symbol);
    }
  };
  return (
    <div className="App">
       <img className="logo" src={logo} alt="BankX Logo" width="200px" />
       Your best crypto lending and savings solution ---------
      {!showCard ? (
        <div>
          {isConnected() ? (
            <div>
              <header className="App-header">
                <p>Welcome BankX User: {signerAddress?.substring(0, 10)}...</p>
              </header>
              <div className="app-content">
                <div className="list-group">
                  <div className="list-group-item">
                    {Object.keys(tokenBalances).map((symbol, idx) => (
                      <div className="balances-card-row" key={idx}>
                        <div className="symbol">
                          <div>{symbol.toUpperCase()}</div>
                        </div>

                        <p className="token-balance">
                          {toRound(tokenBalances[symbol])}
                        </p>

                        <div>
                          <button
                            onClick={() => displayDepositCard(symbol)}
                            className="btn-primary"
                          >
                            Deposit
                          </button>
                        </div>

                        <div>
                          <button
                            onClick={() => displayWithdrawCard(symbol)}
                            className="btn-primary"
                          >
                            Withdraw
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="connect-container">
              <p>You are not connected</p>
              <button onClick={connect} className="connect-btn">
                Connect Metamask
              </button>
            </div>
          )}
        </div>
      ) : (
        <DepositWithdrawCard
          setShowCard={setShowCard}
          symbol={selectedSymbol}
          isWithdraw={isWithdraw}
          isWithdrawCard={isWithdrawCard}
          isDepositCard={isDepositCard}
          depositOrWithdraw={depositOrWithdraw}
          setIsDeposit={setIsDeposit}
          setIsWithdraw={setIsWithdraw}
          setAmount={setAmount}
        />
      )}
    </div>
  );
}

export default App;
