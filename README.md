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
- Edit the <code>Vagrantfile</code> to open up ports used to expose composer REST server. Append the following near towards the end of the <code>Vagrantfile</code>
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
    <pre><code><b>~/fabric-tutorial-vagrant/composer-playground$</b> docker pull hyperledger/fabric-couchdb:x86_64-1.0.4
    <b>~/fabric-tutorial-vagrant/composer-playground$</b> docker tag hyperledger/fabric-couchdb:x86_64-1.0.4 hyperledger/fabric-couchdb:latest
    <b>~/fabric-tutorial-vagrant/composer-playground$</b> git pull
    </code></pre>
  - Edit <code>docker-compose-couch.yaml</code> file, append the following to the ports subsection near the end of the file
    <pre><code>ports:
      - 8080:8080
      - 3000:3000
      - 3001:3001
      - 3002:3002
      - 3003:3003
    </code></pre>
  - Start playground
    <pre><code><b>~/fabric-tutorial-vagrant/composer-playground$</b> ./playground.sh down
    <b>~/fabric-tutorial-vagrant/composer-playground$</b> ./playground.sh -f docker-compose-couch.yaml up
    </code></pre>
  - Go to http://localhost:8080
  - <b>Import</b> the BNA file into composer playground
  - <b>Deploy</b> the BNA file with the following settings:
  ![Alt img](Hyperledger-fabric/setup-guide/network-deployment.jpeg?raw=true)
  - Issue <b>new identities</b>:
    <table>
    <tr>
      <th>ID Name</th>
      <th>Participant</th>
    </tr>
    <tr>
      <td>SGSHAREDNODE</td>
      <td>org.acme.cbcreporting.SharedNode#SG</td>
    </tr>
    <tr>
      <td>IRAS</td>
      <td>org.acme.cbcreporting.TaxAuthority#IRAS</td>
    </tr>
    <tr>
      <td>HMRC</td>
      <td>org.acme.cbcreporting.TaxAuthority#HMRC</td>
    </tr>
    </table>
    
# Preparing Test Data
<b><p>1) MySQL</p></b>
- Open <b>MySQL Command Line Client</b>
- Issue the following commands:
  <pre><code><b>mysql></b> CREATE DATABASE mne_portal;
  <b>mysql></b> USE mne_portal;
  <b>mysql></b> CREATE TABLE mne_info (mne_id VARCHAR(20) PRIMARY KEY, password CHAR(60));
  <b>mysql></b> INSERT INTO mne_info (mne_id, password) VALUES ("SG-MNE1", "$2a$10$o.2XRGhNP6U7mk0kBLoP1OERyDgMWmBzh6X58bhNhvHlCiomdo2pi");
  <b>mysql></b> INSERT INTO mne_info (mne_id, password) VALUES ("SG-MNE2", "$2a$10$o.2XRGhNP6U7mk0kBLoP1OERyDgMWmBzh6X58bhNhvHlCiomdo2pi");
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
- Create Participants
  - In registry: <b>org.acme.cbcreporting.TaxAuthority</b>
    <pre><code>{
      "$class": "org.acme.cbcreporting.TaxAuthority",
      "taxAuthID": "IRAS",
      "taxAuthName": "IRAS",
      "countryCode": "SG",
      "partnerTaxAuth": ["AU","CA","ID","NZ","UK"]
    }

    {
      "$class": "org.acme.cbcreporting.TaxAuthority",
      "taxAuthID": "HMRC",
      "taxAuthName": "HMRC",
      "countryCode": "UK",
      "partnerTaxAuth": ["SG"]
    }
    </code></pre>
  - In registry: <b>org.acme.cbcreporting.SharedNode</b>
    <pre><code>{
      "$class": "org.acme.cbcreporting.SharedNode",
      "nodeID": "SG",
      "nodeName": "SG shared Node",
      "taxAuth": "resource:org.acme.cbcreporting.TaxAuthority#IRAS"
    }
    </code></pre>

# Test Cases
