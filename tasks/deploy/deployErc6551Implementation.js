const { networks } = require("../../networks")

task("deploy-implementation", "Deploys the InCraftERC6551Account contract")
  .addOptionalParam("verify", "Set to true to verify contract", false, types.boolean)
  .setAction(async (taskArgs) => {
    console.log(`Deploying InCraftERC6551Account contract to ${network.name}`)

    console.log("\n__Compiling Contracts__")
    await run("compile")

    console.log(networks[network.name].url)

    const inCraftContractFactory = await ethers.getContractFactory("InCraftERC6551Account")
    const inCraftContract = await inCraftContractFactory.deploy()

    console.log(
      `\nWaiting ${networks[network.name].confirmations} blocks for transaction ${
        inCraftContract.deployTransaction.hash
      } to be confirmed...`
    )

    await inCraftContract.deployTransaction.wait(networks[network.name].confirmations)

    console.log("\nDeployed InCraftERC6551Account contract to:", inCraftContract.address)

    if (network.name === "localFunctionsTestnet") {
      return
    }

    const verifyContract = taskArgs.verify
    if (
      network.name !== "localFunctionsTestnet" &&
      verifyContract &&
      !!networks[network.name].verifyApiKey &&
      networks[network.name].verifyApiKey !== "UNSET"
    ) {
      try {
        console.log("\nVerifying contract...")
        await run("verify:verify", {
          address: inCraftContract.address,
          constructorArguments: [],
        })
        console.log("Contract verified")
      } catch (error) {
        if (!error.message.includes("Already Verified")) {
          console.log(
            "Error verifying contract.  Ensure you are waiting for enough confirmation blocks, delete the build folder and try again."
          )
          console.log(error)
        } else {
          console.log("Contract already verified")
        }
      }
    } else if (verifyContract && network.name !== "localFunctionsTestnet") {
      console.log(
        "\nPOLYGONSCAN_API_KEY, ETHERSCAN_API_KEY or FUJI_SNOWTRACE_API_KEY is missing. Skipping contract verification..."
      )
    }

    console.log(`\InCraftERC6551Account contract deployed to ${inCraftContract.address} on ${network.name}`)
  })
