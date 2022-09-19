import ErlangToolchain, { BEAM_EXT } from "https://pkgs.warp.build/toolchains/erlang.js";
import Rebar3Toolchain from "https://pkgs.warp.build/toolchains/rebar3.js";

const impl = (ctx) => {
  const { label, name, deps, srcs } = ctx.cfg();
  const cwd = Label.path(label);

  ctx.action().runShell({
    script: `

export C_INCLUDE_PATH="$ERL_INCLUDE_PATH:$C_INCLUDE_PATH"
export CPLUS_INCLUDE_PATH="$ERL_INCLUDE_PATH:$CPLUS_INCLUDE_PATH"
export C_LIB_PATH="$ERL_LIB_PATH:$C_LIB_PATH"
export CPLUS_LIB_PATH="$ERL_LIB_PATH:$CPLUS_LIB_PATH"

env | sort -u

cd ${cwd}
rm -rf _build
rebar3 compile || status=$?

if [ \${status:-0} -gt 1 ]; then
  echo "Rebar exited with status $status"
  exit $status
fi

`,
  });

  ctx.action().declareOutputs([
    `${cwd}/_build/default/lib/${name}`
  ])
};

export default Warp.Rule({
  // name: "https://pkgs.warp.build/rules/erlang/common_test",
  name: "common_test",
  mnemonic: "ErlCT",
  impl,
  cfg: {
    name: label(),
    deps: [label()],
    src: file(),
  },
  defaults: {
    deps: [],
  },
  toolchains: [ErlangToolchain, Rebar3Toolchain, CMakeToolchain],
});

