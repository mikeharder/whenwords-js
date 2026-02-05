# Actionlint Implementation Comparison: Docker vs Direct Install on ubuntu-slim

This document compares two approaches for running actionlint in GitHub Actions workflows on the ubuntu-slim runner.

## Approaches

### 1. Docker Image Approach (Previous Implementation)

```yaml
jobs:
  Actionlint:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout repository
      uses: actions/checkout@v6
    
    - name: Setup actionlint matcher
      run: echo "::add-matcher::.github/actionlint-matcher.json"
    
    - name: Actionlint
      uses: docker://rhysd/actionlint:latest
      with:
        args: -color -verbose
```

### 2. Direct Install Approach (Current Implementation)

```yaml
jobs:
  Actionlint:
    runs-on: ubuntu-slim
    steps:
    - name: Checkout repository
      uses: actions/checkout@v6
    
    - name: Setup actionlint matcher
      run: echo "::add-matcher::.github/actionlint-matcher.json"
    
    - name: Install actionlint and shellcheck
      run: |
        # Install actionlint
        curl -sSL https://github.com/rhysd/actionlint/releases/download/v1.7.10/actionlint_1.7.10_linux_amd64.tar.gz | tar -xz
        sudo mv actionlint /usr/local/bin/
        # Install shellcheck for linting shell scripts in workflows
        sudo apt-get update -qq
        sudo apt-get install -y shellcheck
    
    - name: Run actionlint
      run: actionlint -color -verbose
```

## Comparison

### Docker Image Approach

#### Pros
1. **Simplicity**: Single line to run actionlint via `uses: docker://rhysd/actionlint:latest`
2. **No Version Management**: Always pulls the latest version automatically
3. **Official Support**: Uses the officially maintained Docker image by the actionlint author
4. **Isolated Environment**: Docker provides complete isolation with all dependencies bundled
5. **Cross-Platform Consistency**: Same Docker image works across different runner types
6. **No Installation Steps**: Docker handles all setup automatically

#### Cons
1. **Container Overhead**: Docker container startup adds 5-15 seconds of overhead
2. **Runner Compatibility**: Docker containers require full VM runners; not compatible with containerized runners
3. **ubuntu-latest Required**: Cannot use ubuntu-slim (containerized runner) due to nested container limitations
4. **Higher Resource Usage**: Full VM runner (ubuntu-latest) costs more and uses more resources (2 vCPU, 7 GB RAM)
5. **Network Dependency**: Must pull Docker image from registry on each run
6. **Less Control**: Limited ability to customize the environment or troubleshoot issues
7. **Potential Registry Issues**: Dependent on Docker Hub availability and rate limits

### Direct Install Approach

#### Pros
1. **ubuntu-slim Compatible**: Works perfectly with lightweight containerized runner (1 vCPU, 5 GB RAM)
2. **No Container Overhead**: Runs directly on the runner, saving 5-15 seconds per run
3. **Lower Resource Usage**: ubuntu-slim runner is more cost-effective for lightweight tasks
4. **Faster Execution**: Eliminates Docker pull and container startup time
5. **Better for CI/CD**: Optimized for short-running automation tasks (under 15 minutes)
6. **Version Control**: Explicit version pinning (v1.7.10) ensures reproducible builds
7. **Easier Debugging**: Direct access to binary and output without container layer
8. **No Registry Dependencies**: Direct download from GitHub releases (more reliable)

#### Cons
1. **Manual Version Management**: Must manually update version number in workflow
2. **Installation Step Required**: Need to download, extract, and move binary (2-3 extra seconds)
3. **Version Pinning**: Won't automatically get latest version without manual update
4. **Platform Specific**: Download URL must match runner architecture (linux_amd64)
5. **No Checksum Verification**: Current implementation doesn't verify download integrity (could be added)
6. **Maintenance Overhead**: Requires periodic updates to stay current with new releases
7. **Potential Breaking Changes**: Manual updates may introduce unexpected changes

## Performance Comparison

### Execution Time Breakdown

**Docker Approach (ubuntu-latest):**
- Runner startup: ~10-20 seconds
- Checkout: ~5 seconds  
- Docker pull: ~10-20 seconds (cached) or ~30-60 seconds (uncached)
- Container startup: ~5-10 seconds
- Actionlint execution: ~2-5 seconds
- **Total: ~32-110 seconds**

**Direct Install Approach (ubuntu-slim):**
- Runner startup: ~5-10 seconds (faster, containerized)
- Checkout: ~5 seconds
- Binary download & install: ~2-3 seconds
- Actionlint execution: ~2-5 seconds
- **Total: ~14-23 seconds**

**Estimated Savings: 50-80% faster execution time**

## Cost Comparison

GitHub Actions pricing is based on runner minutes:

- **ubuntu-latest** (2 vCPU, 7 GB RAM): Standard pricing
- **ubuntu-slim** (1 vCPU, 5 GB RAM): ~50% cost reduction for eligible workloads

For this lightweight linting task, ubuntu-slim provides significant cost savings without compromising functionality.

## Recommendations

### Use Docker Image When:
- Working with multiple runner types and need consistency
- Want automatic updates without workflow maintenance
- Running on full VM runners (ubuntu-latest)
- Need guaranteed environment isolation
- Workflow complexity isn't sensitive to 10-20 second overhead

### Use Direct Install When:
- Optimizing for cost and performance on ubuntu-slim
- Running lightweight, short-duration tasks
- Want explicit version control and reproducibility
- Need to minimize execution time for CI feedback loops
- Have established workflow maintenance processes
- Working with containerized runners

## Current Choice: Direct Install

This repository uses the **Direct Install approach** for the following reasons:

1. **Cost Efficiency**: Actionlint is a lightweight linting task ideal for ubuntu-slim
2. **Performance**: Faster feedback loops for developers (50-80% faster)
3. **Compatibility**: Other workflows in this repo already use ubuntu-slim
4. **Resource Optimization**: No need for full VM capabilities for this task
5. **Consistency**: Aligns with the project's use of ubuntu-slim across workflows

## Maintenance Notes

### Updating Actionlint Version

To update actionlint to a newer version:

1. Check the latest release at: https://github.com/rhysd/actionlint/releases
2. Update the version in `.github/workflows/actionlint.yaml`:
   ```yaml
   curl -sSL https://github.com/rhysd/actionlint/releases/download/v1.X.X/actionlint_1.X.X_linux_amd64.tar.gz | tar -xz
   ```
3. Test the workflow to ensure compatibility

### Adding Checksum Verification (Optional Enhancement)

For additional security, checksum verification could be added:

```yaml
- name: Install actionlint
  run: |
    VERSION=1.7.10
    curl -sSL https://github.com/rhysd/actionlint/releases/download/v${VERSION}/actionlint_${VERSION}_checksums.txt -o checksums.txt
    curl -sSL https://github.com/rhysd/actionlint/releases/download/v${VERSION}/actionlint_${VERSION}_linux_amd64.tar.gz -o actionlint.tar.gz
    grep linux_amd64.tar.gz checksums.txt | sha256sum -c -
    tar -xzf actionlint.tar.gz
    sudo mv actionlint /usr/local/bin/
```

### Optional Tool Integration: shellcheck and pyflakes

Actionlint can optionally integrate with **shellcheck** (for shell scripts) and **pyflakes** (for Python scripts) to provide deeper linting of `run:` blocks in workflows.

**Shellcheck**: Installed in this repository to lint shell scripts like those in `js-perf.yaml`. On ubuntu-slim, shellcheck must be explicitly installed as it's not pre-installed:

```yaml
sudo apt-get update -qq
sudo apt-get install -y shellcheck
```

**Pyflakes**: Not installed in this repository as there are no Python scripts in the workflows. If Python scripts are added to workflows in the future, install pyflakes:

```yaml
sudo apt-get install -y python3-pyflakes
```

When these tools are not available, actionlint simply skips those checks without failing. The verbose output will show: `Rule "pyflakes" was disabled: exec: "pyflakes": executable file not found in $PATH`.

## References

- [actionlint GitHub Repository](https://github.com/rhysd/actionlint)
- [GitHub Actions ubuntu-slim runner documentation](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners)
- [GitHub Actions Runner Comparison](https://github.blog/changelog/2026-01-22-1-vcpu-linux-runner-now-generally-available-in-github-actions/)

---

*Last Updated: 2026-02-05*
