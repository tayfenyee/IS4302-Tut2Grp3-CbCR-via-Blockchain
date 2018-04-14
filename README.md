# IS4302-Tut2Grp3-CbCR-via-Blockchain
POC to implement CbC report sharing using blockchain

# Setup
<b><p>1) MySQL server</p></b>
- Install the <b>MySQL database server only</b> from <a href="https://dev.mysql.com/downloads/installer/">MySQL</a>
- Select <b>Server Machine</b> as the configuration type
- Select the option to run MySQL as a service
- Launch the MySQL Command-Line Client

<b><p>2) NodeJS</p></b>
- Install <a href="https://nodejs.org/en/download/">Node.js</a>

<b><p>3) Vagrant</p></b>
- Setup Vagrant according to this <a href="https://github.com/suenchunhui/fabric-tutorial-vagrant">link</a>
- Edit the Vagrantfile to open up ports used to expose composer REST server. Append the following near towards the end of the Vagrantfile
  <pre><code>config.vm.network :forwarded_port, guest: 3000, host: 3000  
  config.vm.network :forwarded_port, guest: 3001, host: 3001  
  config.vm.network :forwarded_port, guest: 3002, host: 3002  
  config.vm.network :forwarded_port, guest: 3003, host: 3003  
  </code></pre>
<b><p>4) Source Code</p></b>
- Download <code>MNE-portal-app</code> and <code>Tax-Authority-portal-app</code> from this repo to your PC
- Download <code>Hyperledger-fabric</code> from this repo to your PC
  - Start <b>Vagrant</b>
  - Go to <b>Cloud 9</b> and issue the following commands:
    <pre><code>docker pull hyperledger/fabric-couchdb:x86_64-1.0.4
    docker tag hyperledger/fabric-couchdb:x86_64-1.0.4 hyperledger/fabric-couchdb:latest
    git pull
    </code></pre>
  - Edit <code>docker-compose-couch.yaml</code> file, append the following to the ports subsection near the end of the file
    <pre><code>ports:
      - 8080:8080
      - 3000:3000
      - 3001:3001
      - 3002:3002
      - 3003:3003
    </code></pre>
  - Start playground by inputting the following into the cloud9 composer playground terminal
    <pre><code>./playground.sh down
    ./playground.sh -f docker-compose-couch.yaml up
    </code></pre>
  - Import the BNA file into the playground
    
# Preparing Test Data
<b><p>1) MySQL</p></b>
- Open MySQL Command Line Client, issue the following commands:
  <pre><code>mysql> CREATE DATABASE mne_portal;
  mysql> USE mne_portal;
  mysql> CREATE TABLE mne_info (mne_id VARCHAR(20) PRIMARY KEY, password CHAR(60));
  mysql> INSERT INTO mne_info (mne_id, password) VALUES ("SG-MNE1", "$2a$10$o.2XRGhNP6U7mk0kBLoP1OERyDgMWmBzh6X58bhNhvHlCiomdo2pi");
  mysql> INSERT INTO mne_info (mne_id, password) VALUES ("SG-MNE2", "$2a$10$o.2XRGhNP6U7mk0kBLoP1OERyDgMWmBzh6X58bhNhvHlCiomdo2pi");
  </code></pre>
- Two sets of credentials will be created (password is hashed):
  <table>
  <tr>
    <th>MNE ID</th>
    <th>Password</th>
  </tr>
  <tr>
    <td>SG-MNE1</td>
    <td>p@ssw0rd</td>
  </tr>
  <tr>
    <td>SG-MNE2</td>
    <td>p@ssw0rd</td>
  </tr>
  </table>
  
<b><p>2) In Hyperledger Composer</p></b>

# Test Cases
